import { Router } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { authenticate, roles } from "./auth.js";
import {
  User,
  Booking,
  Caregiver,
  Shift,
  Invoice,
  Ticket,
  Audit,
  Inquiry,
  Service,
  Assignment,
  Agreement,
} from "./models.js";
import { wrap, ok, assert, audit, notify, publicUser } from "./lib.js";
import {
  assignCaregiver,
  changeBooking,
  createInvoice,
  recordPayment,
  issueAgreement,
} from "./workflows.js";
import { email, password } from "../../shared/schemas.js";
export const admin = Router();
admin.use(authenticate);
const ops = roles("owner", "operations");
const finance = roles("owner", "accountant");
const owner = roles("owner");
admin.get(
  "/dashboard",
  roles("owner", "operations", "accountant"),
  wrap(async (req, res) => {
    const financial = ["owner", "accountant"].includes(req.user.role);
    const data: any = {};
    if (req.user.role !== "accountant") {
      data.bookings = await Booking.countDocuments();
      data.active = await Booking.countDocuments({ status: "active" });
      data.inquiries = await Inquiry.countDocuments({ status: "new" });
      data.caregivers = await Caregiver.countDocuments({ status: "approved" });
      data.upcoming = await Shift.find({
        start: { $gte: new Date() },
        status: "scheduled",
      })
        .sort({ start: 1 })
        .limit(5);
    }
    if (financial) {
      const invoices = await Invoice.find();
      data.billedPaise = invoices.reduce(
        (n: number, i: any) => n + i.totalPaise,
        0,
      );
      data.collectedPaise = invoices.reduce(
        (n: number, i: any) => n + i.paidPaise - i.refundedPaise,
        0,
      );
      data.outstandingPaise = invoices.reduce(
        (n: number, i: any) => n + i.totalPaise - i.paidPaise,
        0,
      );
      data.billing = invoices.slice(-12).map((i: any) => ({
        name: i.number.slice(-6),
        billed: i.totalPaise / 100,
        collected: (i.paidPaise - i.refundedPaise) / 100,
      }));
    }
    ok(res, data);
  }),
);
admin.get(
  "/inquiries",
  ops,
  wrap(async (_req, res) =>
    ok(res, await Inquiry.find().sort({ createdAt: -1 }).limit(100)),
  ),
);
admin.patch(
  "/inquiries/:id",
  ops,
  wrap(async (req, res) => {
    const d = z
      .object({ status: z.enum(["reviewed", "closed"]) })
      .strict()
      .parse(req.body);
    const i = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: d },
      { returnDocument: "after" },
    );
    assert(i, 404, "Inquiry not found");
    await audit(req.user._id, "inquiry.updated", String(i._id));
    ok(res, i);
  }),
);
admin.get(
  "/bookings",
  ops,
  wrap(async (req, res) => {
    await audit(req.user._id, "admin.bookings.viewed", "bookings");
    ok(res, await Booking.find().sort({ createdAt: -1 }).limit(100));
  }),
);
admin.patch(
  "/bookings/:id",
  ops,
  wrap(async (req, res) =>
    ok(res, await changeBooking(req.user, String(req.params.id), req.body)),
  ),
);
admin.post(
  "/assignments",
  ops,
  wrap(async (req, res) =>
    ok(res, await assignCaregiver(req.user, req.body), 201),
  ),
);
admin.patch(
  "/assignments/:id",
  ops,
  wrap(async (req, res) => {
    const d = z
      .object({
        status: z.literal("cancelled"),
        reason: z.string().min(10).max(500),
      })
      .strict()
      .parse(req.body);
    const a = await Assignment.findOne({
      _id: req.params.id,
      status: "scheduled",
    });
    assert(
      a,
      409,
      "Only a scheduled assignment can be cancelled; active care requires a reviewed handover",
    );
    assert(
      !(await Shift.exists({
        assignmentId: a._id,
        status: { $in: ["started", "completed"] },
      })),
      409,
      "Attendance already exists",
    );
    a.status = d.status;
    await a.save();
    await Shift.updateMany(
      { assignmentId: a._id, status: "scheduled" },
      { $set: { status: "cancelled" } },
    );
    await audit(req.user._id, "assignment.cancelled", String(a._id), {
      reason: d.reason,
    });
    await notify(
      a.clientId,
      "Your schedule has changed. Contact your coordinator.",
    );
    ok(res, a);
  }),
);
admin.get(
  "/caregivers",
  ops,
  wrap(async (req, res) => {
    await audit(req.user._id, "caregivers.viewed", "caregivers");
    ok(res, await Caregiver.find().limit(100));
  }),
);
const caregiverInput = z
  .object({
    userId: z.string().regex(/^[a-f\d]{24}$/i),
    displayName: z.string().min(2).max(100),
    qualification: z.enum(["nurse", "attendant"]),
    services: z.array(z.string().max(80)).min(1),
    localities: z.array(z.string().max(100)).min(1),
    languages: z.array(z.string().max(30)),
    engagement: z.enum(["employee", "contractor"]),
    maxHours: z.number().min(1).max(12),
    restHours: z.number().min(0).max(24),
    credentialExpiry: z.string().datetime().optional(),
  })
  .strict();
admin.post(
  "/caregivers",
  owner,
  wrap(async (req, res) => {
    const d = caregiverInput.parse(req.body);
    assert(
      await User.exists({ _id: d.userId, role: "caregiver", active: true }),
      400,
      "Create an active caregiver account first",
    );
    const c = await Caregiver.create(d);
    await issueAgreement(d.userId, d.engagement);
    await audit(req.user._id, "caregiver.created", String(c._id));
    ok(res, c, 201);
  }),
);
admin.patch(
  "/caregivers/:id",
  owner,
  wrap(async (req, res) => {
    const d = z
      .object({
        status: z.enum(["approved", "suspended", "inactive"]),
        credentialExpiry: z.string().datetime().optional(),
      })
      .strict()
      .parse(req.body);
    const c = await Caregiver.findById(req.params.id);
    assert(c, 404, "Caregiver not found");
    if (d.status === "approved") {
      assert(
        c.qualification !== "nurse" ||
          new Date(d.credentialExpiry || c.credentialExpiry) > new Date(),
        409,
        "Valid credential expiry is required",
      );
      assert(
        await Agreement.exists({
          userId: c.userId,
          kind: c.engagement,
          acceptedAt: { $exists: true },
          superseded: false,
        }),
        409,
        "Caregiver must accept the engagement agreement",
      );
    }
    Object.assign(c, d, { verifiedAt: new Date() });
    await c.save();
    await audit(req.user._id, "caregiver.verification", String(c._id), {
      status: d.status,
    });
    ok(res, c);
  }),
);
admin.get(
  "/users",
  owner,
  wrap(async (_req, res) =>
    ok(res, (await User.find().limit(100)).map(publicUser)),
  ),
);
admin.post(
  "/users",
  owner,
  wrap(async (req, res) => {
    const d = z
      .object({
        name: z.string().min(2).max(100),
        email,
        password,
        role: z.enum(["operations", "coordinator", "caregiver", "accountant"]),
      })
      .strict()
      .parse(req.body);
    const u = await User.create({
      name: d.name,
      email: d.email,
      role: d.role,
      passwordHash: await argon2.hash(d.password),
    });
    await audit(req.user._id, "staff.created", String(u._id), { role: u.role });
    ok(res, publicUser(u), 201);
  }),
);
admin.patch(
  "/users/:id",
  owner,
  wrap(async (req, res) => {
    const d = z
      .object({
        active: z.boolean().optional(),
        role: z
          .enum([
            "operations",
            "coordinator",
            "caregiver",
            "accountant",
            "client",
          ])
          .optional(),
      })
      .strict()
      .parse(req.body);
    const u = await User.findOne({
      _id: req.params.id,
      role: { $ne: "owner" },
    });
    assert(u, 409, "Owner accounts require a separate handover");
    assert(
      !(await Assignment.exists({
        caregiverId: u._id,
        status: { $in: ["scheduled", "active"] },
      })),
      409,
      "Reassign active work before changing this account",
    );
    Object.assign(u, d);
    await u.save();
    await audit(req.user._id, "user.permissions.changed", String(u._id), d);
    ok(res, publicUser(u));
  }),
);
admin.get(
  "/clients",
  ops,
  wrap(async (_req, res) =>
    ok(res, (await User.find({ role: "client" }).limit(100)).map(publicUser)),
  ),
);
admin.get(
  "/shifts",
  ops,
  wrap(async (_req, res) =>
    ok(res, await Shift.find().sort({ start: -1 }).limit(100)),
  ),
);
admin.get(
  "/invoices",
  finance,
  wrap(async (_req, res) =>
    ok(res, await Invoice.find().sort({ createdAt: -1 }).limit(100)),
  ),
);
admin.post(
  "/invoices",
  finance,
  wrap(async (req, res) =>
    ok(res, await createInvoice(req.user, req.body), 201),
  ),
);
admin.post(
  "/invoices/:id/payments",
  finance,
  wrap(async (req, res) =>
    ok(res, await recordPayment(req.user, String(req.params.id), req.body)),
  ),
);
admin.get(
  "/tickets",
  ops,
  wrap(async (_req, res) =>
    ok(res, await Ticket.find().sort({ createdAt: -1 }).limit(100)),
  ),
);
admin.patch(
  "/tickets/:id",
  ops,
  wrap(async (req, res) => {
    const d = z
      .object({
        status: z.enum(["reviewing", "resolved"]),
        resolution: z.string().min(10).max(2000),
      })
      .strict()
      .parse(req.body);
    const t = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: d },
      { returnDocument: "after" },
    );
    assert(t, 404, "Request not found");
    await audit(req.user._id, "ticket.reviewed", String(t._id), {
      status: d.status,
    });
    await notify(t.userId, "Your support request has an update");
    ok(res, t);
  }),
);
admin.get(
  "/audit-logs",
  owner,
  wrap(async (_req, res) =>
    ok(res, await Audit.find().sort({ createdAt: -1 }).limit(100)),
  ),
);
admin.get(
  "/reports",
  finance,
  wrap(async (req, res) => {
    const rows = await Invoice.find().sort({ createdAt: -1 }).limit(1000);
    const csv = [
      "number,due_date,total_inr,received_inr,refunded_inr,status",
      ...rows.map((i: any) =>
        [
          i.number,
          i.dueDate,
          i.totalPaise / 100,
          i.paidPaise / 100,
          i.refundedPaise / 100,
          i.status,
        ].join(","),
      ),
    ].join("\n");
    await audit(req.user._id, "report.exported", "billing");
    res.type("text/csv").attachment("atharv-billing.csv").send(csv);
  }),
);
admin.patch(
  "/services/:id",
  owner,
  wrap(async (req, res) => {
    const d = z
      .object({
        name: z.string().min(2).max(100).optional(),
        summary: z.string().min(10).max(300).optional(),
        description: z.string().min(20).max(2000).optional(),
        active: z.boolean().optional(),
        ratePaise: z.number().int().positive().optional(),
        rateUnit: z
          .enum(["visit", "hour", "shift", "day", "week", "month"])
          .optional(),
      })
      .strict()
      .parse(req.body);
    const s = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: d },
      { returnDocument: "after", runValidators: true },
    );
    assert(s, 404, "Service not found");
    await audit(req.user._id, "service.updated", String(s._id));
    ok(res, s);
  }),
);
