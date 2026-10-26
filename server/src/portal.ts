import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { authenticate, roles } from "./auth.js";
import {
  Booking,
  Agreement,
  Assignment,
  Shift,
  Invoice,
  Ticket,
  Notification,
  Caregiver,
  Payment,
  Service,
} from "./models.js";
import { bookingSchema, supportSchema } from "../../shared/schemas.js";
import { wrap, ok, assert, id, audit, notify } from "./lib.js";
import { pdf } from "./documents.js";
export const portal = Router();
portal.use(authenticate);
portal.get(
  "/caregiver-profile",
  roles("caregiver"),
  wrap(async (req, res) => {
    const profile = await Caregiver.findOne({ userId: req.user._id }).select(
      "displayName qualification status credentialExpiry maxHours restHours services",
    );
    ok(res, profile);
  }),
);
export function scope(req: any): any {
  if (["owner", "operations"].includes(req.user.role)) return {};
  if (req.user.role === "coordinator") return { coordinatorId: req.user._id };
  if (req.user.role === "client") return { clientId: req.user._id };
  if (req.user.role === "caregiver") return { caregiverId: req.user._id };
  return { _id: null };
}
portal.get(
  "/bookings",
  wrap(async (req, res) => {
    const records = await Booking.find(scope(req))
      .sort({ createdAt: -1 })
      .limit(100);
    await audit(req.user._id, "bookings.viewed", "booking-list");
    ok(res, records);
  }),
);
portal.post(
  "/bookings",
  roles("client"),
  wrap(async (req, res) => {
    const d = bookingSchema.parse(req.body);
    assert(
      await Service.exists({ slug: d.service, active: true }),
      400,
      "Choose an available service",
    );
    assert(
      d.startDate >= new Date().toISOString().slice(0, 10),
      400,
      "Choose today or a future date",
    );
    const { consent, ...fields } = d;
    void consent;
    const b = await Booking.create({
      ...fields,
      clientId: req.user._id,
      reference: id("AE"),
      consentedAt: new Date(),
    });
    await audit(req.user._id, "booking.created", String(b._id));
    await notify(req.user._id, `Request ${b.reference} received`);
    ok(res, b, 201);
  }),
);
portal.get(
  "/bookings/:id",
  wrap(async (req, res) => {
    const b = await Booking.findOne({ _id: req.params.id, ...scope(req) });
    assert(b, 404, "Booking not found");
    await audit(req.user._id, "booking.viewed", String(b._id));
    ok(res, b);
  }),
);
portal.get(
  "/assignments",
  wrap(async (req, res) => {
    let filter = scope(req);
    if (req.user.role === "coordinator") {
      const bookings = await Booking.find(scope(req)).select("_id");
      filter = { bookingId: { $in: bookings.map((b: any) => b._id) } };
    }
    const rows = await Assignment.find(filter)
      .sort({ start: -1 })
      .limit(100)
      .lean();
    const result = [];
    for (const a of rows) {
      const c = await Caregiver.findOne({ userId: a.caregiverId }).select(
        "displayName qualification languages",
      );
      const approvedClient = await Booking.findById(a.bookingId)
        .select("preferredName locality service")
        .lean();
      result.push({ ...a, caregiver: c, approvedClient });
    }
    await audit(req.user._id, "assignments.viewed", "assignment-list");
    ok(res, result);
  }),
);
portal.get(
  "/shifts",
  wrap(async (req, res) => {
    let filter = scope(req);
    if (req.user.role === "coordinator") {
      const bookings = await Booking.find(scope(req)).select("_id");
      filter = { bookingId: { $in: bookings.map((b: any) => b._id) } };
    }
    ok(res, await Shift.find(filter).sort({ start: 1 }).limit(100));
  }),
);
portal.post(
  "/shifts/:id/:action",
  roles("caregiver"),
  wrap(async (req, res) => {
    const action = z.enum(["start", "complete"]).parse(req.params.action);
    const data = z
      .object({
        notes: z.string().max(1500).optional(),
        tasks: z.array(z.string().max(100)).max(20).optional(),
      })
      .strict()
      .parse(req.body);
    const now = new Date();
    const filter: any = {
      _id: req.params.id,
      caregiverId: req.user._id,
      status: action === "start" ? "scheduled" : "started",
    };
    if (action === "start") {
      filter.start = { $lte: new Date(Date.now() + 30 * 60000) };
      filter.end = { $gt: now };
    }
    const shift = await Shift.findOneAndUpdate(
      filter,
      {
        $set:
          action === "start"
            ? { status: "started", actualStart: now }
            : { status: "completed", actualEnd: now, ...data },
      },
      { returnDocument: "after" },
    );
    assert(
      shift,
      409,
      "Shift cannot be changed. Check its schedule and current attendance status.",
    );
    await audit(req.user._id, `shift.${action}`, String(shift._id));
    ok(res, shift);
  }),
);
portal.get(
  "/agreements",
  wrap(async (req, res) =>
    ok(
      res,
      await Agreement.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(100),
    ),
  ),
);
portal.post(
  "/agreements/:id/accept",
  wrap(async (req, res) => {
    const d = z
      .object({ consent: z.literal(true), name: z.string().min(2).max(100) })
      .strict()
      .parse(req.body);
    const a = await Agreement.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        acceptedAt: { $exists: false },
        superseded: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { acceptedAt: new Date(), acceptedName: d.name } },
      { returnDocument: "after" },
    );
    assert(a, 409, "Agreement is unavailable or has already been accepted");
    await audit(req.user._id, "agreement.accepted", String(a._id), {
      version: a.version,
      hash: a.hash,
    });
    ok(res, a);
  }),
);
portal.get(
  "/agreements/:id/pdf",
  wrap(async (req, res) => {
    const a = await Agreement.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    assert(a, 404, "Agreement not found");
    await audit(req.user._id, "agreement.downloaded", String(a._id));
    pdf(
      res,
      `Care agreement — ${a.version}`,
      [
        a.text,
        `Document hash: ${a.hash}`,
        `Accepted by: ${a.acceptedName || "Not yet accepted"}`,
        `Acceptance: ${a.acceptedAt?.toISOString() || "Pending"}`,
      ],
      `agreement-${a._id}`,
    );
  }),
);
portal.get(
  "/invoices",
  roles("client", "owner", "accountant"),
  wrap(async (req, res) =>
    ok(
      res,
      await Invoice.find(
        req.user.role === "client" ? { clientId: req.user._id } : {},
      )
        .sort({ createdAt: -1 })
        .limit(100),
    ),
  ),
);
portal.get(
  "/invoices/:id/pdf",
  roles("client", "owner", "accountant"),
  wrap(async (req, res) => {
    const i = await Invoice.findOne({
      _id: req.params.id,
      ...(req.user.role === "client" ? { clientId: req.user._id } : {}),
    });
    assert(i, 404, "Invoice not found");
    const payments = await Payment.find({ invoiceId: i._id });
    await audit(req.user._id, "invoice.downloaded", String(i._id));
    pdf(
      res,
      i.number,
      [
        i.description,
        `Quantity: ${i.quantity}`,
        `Subtotal: INR ${(i.subtotalPaise / 100).toFixed(2)}`,
        `Tax: INR ${(i.taxPaise / 100).toFixed(2)}`,
        `Total: INR ${(i.totalPaise / 100).toFixed(2)}`,
        `Received: INR ${(i.paidPaise / 100).toFixed(2)}`,
        `Refunded: INR ${(i.refundedPaise / 100).toFixed(2)}`,
        `Due: ${i.dueDate}`,
        ...payments.map(
          (p: any) =>
            `${p.kind}: INR ${(p.amountPaise / 100).toFixed(2)} | ${p.reference}`,
        ),
      ],
      i.number,
    );
  }),
);
portal.get(
  "/tickets",
  wrap(async (req, res) =>
    ok(
      res,
      await Ticket.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(100),
    ),
  ),
);
portal.post(
  "/tickets",
  wrap(async (req, res) => {
    const d = supportSchema.parse(req.body);
    if (d.bookingId)
      assert(
        await Booking.exists({ _id: d.bookingId, clientId: req.user._id }),
        404,
        "Booking not found",
      );
    const ticket = await Ticket.create({ ...d, userId: req.user._id });
    await audit(
      req.user._id,
      `request.${d.type.toLowerCase()}`,
      String(ticket._id),
    );
    await notify(
      req.user._id,
      "Your request has been received for human review",
    );
    ok(res, ticket, 201);
  }),
);
portal.get(
  "/notifications",
  wrap(async (req, res) =>
    ok(
      res,
      await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(100),
    ),
  ),
);
portal.post(
  "/notifications/:id/read",
  wrap(async (req, res) => {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { read: true } },
      { returnDocument: "after" },
    );
    assert(n, 404, "Notification not found");
    ok(res, n);
  }),
);
portal.patch(
  "/profile",
  wrap(async (req, res) => {
    const d = z
      .object({ name: z.string().trim().min(2).max(100) })
      .strict()
      .parse(req.body);
    req.user.name = d.name;
    await req.user.save();
    await audit(req.user._id, "profile.updated", String(req.user._id));
    ok(res, { name: d.name });
  }),
);
portal.post(
  "/deactivate",
  wrap(async (req, res) => {
    assert(
      req.user.role !== "owner",
      409,
      "Owner deactivation requires an administrator handover",
    );
    await mongoose.connection.transaction(async (session) => {
      req.user.active = false;
      await req.user.save({ session });
      await audit(
        req.user._id,
        "account.deactivated",
        String(req.user._id),
        {},
        session,
      );
    });
    ok(res, { deactivated: true });
  }),
);
