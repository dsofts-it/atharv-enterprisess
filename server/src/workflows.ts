import mongoose from "mongoose";
import { z } from "zod";
import {
  User,
  Booking,
  Caregiver,
  Agreement,
  Assignment,
  Shift,
  Invoice,
  Payment,
  Ticket,
  Service,
} from "./models.js";
import { assert, audit, notify, id, hash } from "./lib.js";
import { agreementText } from "../../shared/catalog.js";
export const transitions: Record<string, string[]> = {
  inquiry: ["assessment", "rejected"],
  assessment: ["quote", "rejected"],
  quote: ["agreement", "assessment"],
  agreement: ["confirmed", "assessment"],
  confirmed: ["cancelled"],
  active: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rejected: [],
};
export async function issueAgreement(
  userId: any,
  kind: string,
  bookingId?: any,
  session?: mongoose.ClientSession,
) {
  return (
    await Agreement.create(
      [
        {
          userId,
          kind,
          bookingId,
          version: "draft-1",
          text: agreementText,
          hash: hash(agreementText),
          expiresAt: new Date(Date.now() + 365 * 86400000),
        },
      ],
      session ? { session } : {},
    )
  )[0];
}
export async function changeBooking(
  actor: any,
  bookingId: string,
  input: unknown,
) {
  const data = z
    .object({
      status: z.enum([
        "assessment",
        "quote",
        "agreement",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ]),
      quotePaise: z.number().int().positive().optional(),
      quoteDescription: z.string().min(5).max(1000).optional(),
      billingApproved: z.boolean().optional(),
      coordinatorId: z.string().optional(),
    })
    .strict()
    .parse(input);
  return mongoose.connection.transaction(async (session) => {
    const b = await Booking.findById(bookingId).session(session);
    assert(b, 404, "Booking not found");
    assert(
      transitions[b.status]?.includes(data.status),
      409,
      "This status transition is not allowed",
    );
    if (data.status === "quote") {
      assert(
        data.quotePaise && data.quoteDescription,
        400,
        "Provide an agreed quote amount and description",
      );
      b.quotePaise = data.quotePaise;
      b.quoteDescription = data.quoteDescription;
    }
    if (data.coordinatorId) {
      assert(
        await User.exists({
          _id: data.coordinatorId,
          role: "coordinator",
          active: true,
        }).session(session),
        400,
        "Choose an active coordinator",
      );
      b.coordinatorId = data.coordinatorId;
    }
    if (data.status === "agreement")
      await issueAgreement(b.clientId, "client", b._id, session);
    if (data.status === "confirmed") {
      assert(
        b.quotePaise && data.billingApproved === true,
        409,
        "Confirm the billing arrangement",
      );
      assert(
        await Agreement.exists({
          bookingId: b._id,
          userId: b.clientId,
          acceptedAt: { $exists: true },
          superseded: false,
          expiresAt: { $gt: new Date() },
        }).session(session),
        409,
        "The client must accept the current agreement",
      );
      b.billingApproved = true;
    }
    if (["completed", "cancelled"].includes(data.status)) {
      assert(
        !(await Shift.exists({ bookingId: b._id, status: "started" }).session(
          session,
        )),
        409,
        "Complete the running shift before closing care",
      );
      await Shift.updateMany(
        { bookingId: b._id, status: "scheduled" },
        { $set: { status: "cancelled" } },
        { session },
      );
      await Assignment.updateMany(
        { bookingId: b._id, status: { $in: ["scheduled", "active"] } },
        {
          $set: {
            status: data.status === "completed" ? "completed" : "cancelled",
          },
        },
        { session },
      );
    }
    b.status = data.status;
    b.version += 1;
    await b.save({ session });
    await audit(
      actor._id,
      "booking.status",
      String(b._id),
      { status: b.status },
      session,
    );
    await notify(
      b.clientId,
      `Care request ${b.reference}: ${b.status}`,
      undefined,
      session,
    );
    return b;
  });
}
export const assignmentSchema = z
  .object({
    bookingId: z.string().regex(/^[a-f\d]{24}$/i),
    caregiverId: z.string().regex(/^[a-f\d]{24}$/i),
    start: z.string().datetime(),
    end: z.string().datetime(),
    instructions: z.string().max(1500).default(""),
  })
  .strict();
export async function assignCaregiver(actor: any, input: unknown) {
  const d = assignmentSchema.parse(input);
  const start = new Date(d.start),
    end = new Date(d.end);
  assert(
    start < end && start.getTime() >= Date.now() - 60000,
    400,
    "Choose a future start and a later end",
  );
  return mongoose.connection.transaction(async (session) => {
    // Every scheduler writes the same caregiver user document in the transaction.
    // Concurrent attempts cause a write conflict and retry against committed shifts.
    const worker = await User.findOneAndUpdate(
      { _id: d.caregiverId, role: "caregiver", active: true },
      { $inc: { scheduleVersion: 1 } },
      { returnDocument: "after", session },
    );
    assert(worker, 400, "Caregiver account is unavailable");
    const c = await Caregiver.findOne({
      userId: d.caregiverId,
      status: "approved",
    }).session(session);
    assert(c, 409, "Caregiver is not approved");
    const b = await Booking.findById(d.bookingId).session(session);
    assert(
      b && ["confirmed", "active"].includes(b.status) && b.billingApproved,
      409,
      "Booking must be confirmed with a billing arrangement",
    );
    const service = await Service.findOne({ slug: b.service }).session(session);
    assert(service?.active, 400, "Service is unavailable");
    assert(
      c.services.includes(b.service) && c.localities.includes(b.locality),
      409,
      "Caregiver is not eligible for this service or locality",
    );
    if (service.clinical || service.requiredQualification)
      assert(
        c.qualification === (service.requiredQualification || "nurse") &&
          c.credentialExpiry &&
          c.credentialExpiry > end,
        409,
        "Valid credentials for this clinical service are required",
      );
    assert(
      (end.getTime() - start.getTime()) / 3600000 <= c.maxHours,
      409,
      "Shift exceeds the caregiver working-hour limit",
    );
    assert(
      await Agreement.exists({
        userId: c.userId,
        kind: c.engagement,
        acceptedAt: { $exists: true },
        superseded: false,
        expiresAt: { $gt: end },
      }).session(session),
      409,
      "Caregiver agreement must be accepted and current",
    );
    assert(
      await Agreement.exists({
        bookingId: b._id,
        userId: b.clientId,
        acceptedAt: { $exists: true },
        superseded: false,
        expiresAt: { $gt: end },
      }).session(session),
      409,
      "Client agreement must be current",
    );
    const rest = c.restHours * 3600000;
    assert(
      !(await Shift.exists({
        caregiverId: c.userId,
        status: { $ne: "cancelled" },
        start: { $lt: new Date(end.getTime() + rest) },
        end: { $gt: new Date(start.getTime() - rest) },
      }).session(session)),
      409,
      "Caregiver has a conflicting shift or insufficient rest",
    );
    assert(
      !(await Ticket.exists({
        userId: c.userId,
        type: "Leave",
        status: { $in: ["open", "reviewing"] },
      }).session(session)),
      409,
      "Review the caregiver’s pending leave before scheduling",
    );
    const a = (
      await Assignment.create(
        [
          {
            bookingId: b._id,
            clientId: b.clientId,
            caregiverId: c.userId,
            start,
            end,
            instructions: d.instructions,
          },
        ],
        { session },
      )
    )[0];
    await Shift.create(
      [
        {
          assignmentId: a._id,
          bookingId: b._id,
          clientId: b.clientId,
          caregiverId: c.userId,
          start,
          end,
        },
      ],
      { session },
    );
    b.status = "active";
    b.version += 1;
    await b.save({ session });
    await audit(
      actor._id,
      "assignment.created",
      String(a._id),
      { bookingId: String(b._id) },
      session,
    );
    await notify(
      b.clientId,
      "A caregiver shift has been coordinated",
      undefined,
      session,
    );
    await notify(
      c.userId,
      "A new shift is available in your schedule",
      undefined,
      session,
    );
    return a;
  });
}
export const invoiceSchema = z
  .object({
    bookingId: z.string(),
    description: z.string().min(5).max(300),
    quantity: z.number().int().min(1).max(10000),
    unitPaise: z.number().int().min(1).max(100000000),
    taxBps: z.number().int().min(0).max(10000),
    dueDate: z.string().date(),
  })
  .strict();
export function calculateInvoice(
  quantity: number,
  unitPaise: number,
  taxBps: number,
) {
  const subtotalPaise = quantity * unitPaise;
  const taxPaise = Math.round((subtotalPaise * taxBps) / 10000);
  return { subtotalPaise, taxPaise, totalPaise: subtotalPaise + taxPaise };
}
export async function createInvoice(actor: any, input: unknown) {
  const d = invoiceSchema.parse(input);
  return mongoose.connection.transaction(async (session) => {
    const b = await Booking.findById(d.bookingId).session(session);
    assert(
      b && b.billingApproved,
      409,
      "An approved booking and billing arrangement are required",
    );
    const invoice = (
      await Invoice.create(
        [
          {
            ...d,
            ...calculateInvoice(d.quantity, d.unitPaise, d.taxBps),
            number: id("INV"),
            clientId: b.clientId,
          },
        ],
        { session },
      )
    )[0];
    await audit(actor._id, "invoice.created", String(invoice._id), {}, session);
    await notify(
      b.clientId,
      "An invoice is ready to review",
      undefined,
      session,
    );
    return invoice;
  });
}
export async function recordPayment(
  actor: any,
  invoiceId: string,
  input: unknown,
) {
  const d = z
    .object({
      amountPaise: z.number().int().positive(),
      reference: z.string().min(5).max(100),
      kind: z.enum(["payment", "refund"]),
      reason: z.string().min(5).max(500),
    })
    .strict()
    .parse(input);
  return mongoose.connection.transaction(async (session) => {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId },
      { $inc: { version: 1 } },
      { returnDocument: "after", session },
    );
    assert(invoice, 404, "Invoice not found");
    assert(
      !(await Payment.exists({ reference: d.reference }).session(session)),
      409,
      "This payment reference has already been recorded",
    );
    if (d.kind === "payment") {
      assert(
        d.amountPaise <= invoice.totalPaise - invoice.paidPaise,
        409,
        "Amount exceeds the outstanding balance",
      );
      invoice.paidPaise += d.amountPaise;
    } else {
      assert(
        actor.role === "owner",
        403,
        "Owner approval is required for refunds",
      );
      assert(
        d.amountPaise <= invoice.paidPaise - invoice.refundedPaise,
        409,
        "Refund exceeds the unrefunded amount",
      );
      invoice.refundedPaise += d.amountPaise;
    }
    invoice.status =
      invoice.paidPaise >= invoice.totalPaise
        ? "paid"
        : invoice.paidPaise
          ? "partial"
          : "unpaid";
    await invoice.save({ session });
    await Payment.create([{ ...d, invoiceId, actorId: actor._id }], {
      session,
    });
    await audit(
      actor._id,
      `finance.${d.kind}`,
      String(invoice._id),
      { amountPaise: d.amountPaise },
      session,
    );
    await notify(
      invoice.clientId,
      "Your billing record has been updated",
      undefined,
      session,
    );
    return invoice;
  });
}
