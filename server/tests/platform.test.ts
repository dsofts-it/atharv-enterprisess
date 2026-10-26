import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import argon2 from "argon2";
import { app } from "../src/app.js";
import {
  User,
  Caregiver,
  Agreement,
  Shift,
  Audit,
  Service,
  Invoice,
  models,
} from "../src/models.js";
import {
  assignCaregiver,
  calculateInvoice,
  issueAgreement,
  changeBooking,
  recordPayment,
} from "../src/workflows.js";
import { services } from "../../shared/catalog.js";
const origin = "http://127.0.0.1:5173";
let repl: MongoMemoryReplSet;
let owner: any, client: any, worker: any, booking: any;
const alice = request.agent(app),
  bob = request.agent(app);
const register = (agent: any, address: string) =>
  agent.post("/api/v1/auth/register").set("Origin", origin).send({
    name: "Fictional Test Client",
    email: address,
    password: "Testing-only-password-984!",
  });
beforeAll(async () => {
  repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(repl.getUri());
  await Promise.all(Object.values(models).map((m) => m.init()));
  await Service.insertMany(services);
  owner = await User.create({
    name: "Fictional Owner",
    email: "owner@example.test",
    role: "owner",
    passwordHash: await argon2.hash("not-used-in-production"),
  });
  worker = await User.create({
    name: "Fictional Caregiver",
    email: "worker@example.test",
    role: "caregiver",
    passwordHash: "unusable",
  });
  await register(alice, "alice@example.test");
  await register(bob, "bob@example.test");
  client = await User.findOne({ email: "alice@example.test" });
});
afterAll(async () => {
  await mongoose.disconnect();
  await repl?.stop();
});
describe("public access and authentication", () => {
  it("allows public browsing", async () => {
    expect((await request(app).get("/api/v1/services")).body.data).toHaveLength(
      6,
    );
  });
  it("requires authentication for detailed bookings", async () => {
    expect(
      (
        await request(app)
          .post("/api/v1/portal/bookings")
          .set("Origin", origin)
          .send({})
      ).status,
    ).toBe(401);
  });
  it("rejects untrusted mutation origins", async () => {
    expect(
      (
        await request(app)
          .post("/api/v1/auth/login")
          .set("Origin", "https://untrusted.test")
          .send({})
      ).status,
    ).toBe(403);
  });
  it("does not allow privileged self-registration", async () => {
    expect(
      (
        await request(app)
          .post("/api/v1/auth/register")
          .set("Origin", origin)
          .send({
            name: "Attacker",
            email: "attacker@example.test",
            password: "long-enough-secret",
            role: "owner",
          })
      ).status,
    ).toBe(400);
  });
  it("handles incorrect login safely", async () => {
    expect(
      (
        await request(app)
          .post("/api/v1/auth/login")
          .set("Origin", origin)
          .send({ email: "alice@example.test", password: "incorrect" })
      ).status,
    ).toBe(401);
  });
  it("creates a minimum-necessary booking", async () => {
    const res = await alice
      .post("/api/v1/portal/bookings")
      .set("Origin", origin)
      .send({
        service: "elderly-care",
        preferredName: "Fictional Client",
        locality: "Baner",
        startDate: "2030-01-01",
        shift: "Day",
        duration: 7,
        instructions: "Test fixture only",
        consent: true,
      });
    expect(res.status).toBe(201);
    booking = res.body.data;
    expect(booking.reference).toMatch(/^AE-/);
  });
  it("enforces resource ownership", async () => {
    expect(
      (await bob.get(`/api/v1/portal/bookings/${booking._id}`)).status,
    ).toBe(404);
    expect((await bob.get("/api/v1/admin/bookings")).status).toBe(403);
  });
  it("rejects expired password recovery tokens", async () => {
    expect(
      (
        await request(app)
          .post("/api/v1/auth/reset-password")
          .set("Origin", origin)
          .send({ token: "a".repeat(80), password: "long-enough-password" })
      ).status,
    ).toBe(400);
  });
  it("rotates refresh tokens and revokes logout sessions", async () => {
    const agent = request.agent(app);
    await register(agent, "rotate@example.test");
    const refreshed = await agent
      .post("/api/v1/auth/refresh")
      .set("Origin", origin);
    expect(refreshed.status).toBe(200);
    await agent.post("/api/v1/auth/logout").set("Origin", origin);
    expect((await agent.get("/api/v1/auth/me")).status).toBe(401);
  });
});
describe("agreement, assignment and finance controls", () => {
  it("requires the lifecycle and accepted agreement", async () => {
    await changeBooking(owner, booking._id, { status: "assessment" });
    await changeBooking(owner, booking._id, {
      status: "quote",
      quotePaise: 100000,
      quoteDescription: "Fictional test quote",
    });
    await changeBooking(owner, booking._id, { status: "agreement" });
    await expect(
      changeBooking(owner, booking._id, {
        status: "confirmed",
        billingApproved: true,
      }),
    ).rejects.toThrow("accept");
    const a = await Agreement.findOne({ bookingId: booking._id });
    expect(
      (
        await bob
          .post(`/api/v1/portal/agreements/${a._id}/accept`)
          .set("Origin", origin)
          .send({ consent: true, name: "Other Client" })
      ).status,
    ).toBe(409);
    expect(
      (
        await alice
          .post(`/api/v1/portal/agreements/${a._id}/accept`)
          .set("Origin", origin)
          .send({ consent: true, name: "Fictional Client" })
      ).status,
    ).toBe(200);
    await changeBooking(owner, booking._id, {
      status: "confirmed",
      billingApproved: true,
    });
  });
  it("serializes competing assignments", async () => {
    await Caregiver.create({
      userId: worker._id,
      displayName: "Fictional Caregiver",
      qualification: "attendant",
      services: ["elderly-care"],
      localities: ["Baner"],
      languages: ["Marathi"],
      status: "approved",
      engagement: "employee",
      maxHours: 12,
      restHours: 8,
    });
    const a = await issueAgreement(worker._id, "employee");
    a.acceptedAt = new Date();
    a.expiresAt = new Date("2031-01-01");
    await a.save();
    await Agreement.updateMany(
      { bookingId: booking._id },
      { $set: { expiresAt: new Date("2031-01-01") } },
    );
    const data = {
      bookingId: booking._id,
      caregiverId: String(worker._id),
      start: "2030-01-01T03:00:00.000Z",
      end: "2030-01-01T11:00:00.000Z",
    };
    const results = await Promise.allSettled([
      assignCaregiver(owner, data),
      assignCaregiver(owner, data),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await Shift.countDocuments({ caregiverId: worker._id })).toBe(1);
  });
  it("rejects shifts beyond configured working hours", async () => {
    await expect(
      assignCaregiver(owner, {
        bookingId: booking._id,
        caregiverId: String(worker._id),
        start: "2030-01-03T03:00:00.000Z",
        end: "2030-01-04T03:00:00.000Z",
      }),
    ).rejects.toThrow("working-hour");
  });
  it("calculates totals on the server", () => {
    expect(calculateInvoice(3, 10000, 1800)).toEqual({
      subtotalPaise: 30000,
      taxPaise: 5400,
      totalPaise: 35400,
    });
  });
  it("prevents overpayments and duplicate financial references", async () => {
    const invoice = await Invoice.create({
      number: "TEST-INV",
      bookingId: booking._id,
      clientId: client._id,
      description: "Fictional fixture",
      quantity: 1,
      unitPaise: 10000,
      taxBps: 0,
      totalPaise: 10000,
      subtotalPaise: 10000,
      taxPaise: 0,
      dueDate: "2030-01-02",
    });
    const p = {
      amountPaise: 10000,
      reference: "TEST-REFERENCE",
      kind: "payment",
      reason: "Test bank reconciliation",
    };
    await recordPayment(owner, String(invoice._id), p);
    await expect(
      recordPayment(owner, String(invoice._id), p),
    ).rejects.toThrow();
    expect((await Invoice.findById(invoice._id)).paidPaise).toBe(10000);
    await expect(
      recordPayment(
        { ...owner.toObject(), role: "accountant" },
        String(invoice._id),
        { ...p, kind: "refund", reference: "TEST-REFUND" },
      ),
    ).rejects.toThrow("Owner");
  });
  it("writes audit events for critical actions", async () => {
    expect(await Audit.countDocuments({ action: "assignment.created" })).toBe(
      1,
    );
    expect(
      await Audit.countDocuments({ action: "agreement.accepted" }),
    ).toBeGreaterThan(0);
    expect(await Audit.countDocuments({ action: "finance.payment" })).toBe(1);
  });
  it("restricts caregiver profile details to the authenticated caregiver", async () => {
    expect(
      (await request(app).get("/api/v1/portal/caregiver-profile")).status,
    ).toBe(401);
    expect((await alice.get("/api/v1/portal/caregiver-profile")).status).toBe(
      403,
    );
    worker.passwordHash = await argon2.hash(
      "Fictional-worker-test-only-password",
    );
    await worker.save();
    const agent = request.agent(app);
    expect(
      (
        await agent.post("/api/v1/auth/login").set("Origin", origin).send({
          email: worker.email,
          password: "Fictional-worker-test-only-password",
        })
      ).status,
    ).toBe(200);
    const profile = await agent.get("/api/v1/portal/caregiver-profile");
    expect(profile.status).toBe(200);
    expect(profile.body.data.displayName).toBe("Fictional Caregiver");
    expect(profile.body.data.userId).toBeUndefined();
    expect(profile.body.data.email).toBeUndefined();
    const assignments = await agent.get("/api/v1/portal/assignments");
    expect(assignments.body.data).toHaveLength(1);
    expect(assignments.body.data[0].approvedClient.preferredName).toBe(
      "Fictional Client",
    );
    expect(assignments.body.data[0].approvedClient.clientId).toBeUndefined();
  });
});
