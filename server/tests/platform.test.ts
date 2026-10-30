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
  Inquiry,
  Notification,
  Content,
  Media,
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
  it("persists an enquiry without email, prevents retry duplicates and notifies owners", async () => {
    const input = {
      name: "Fictional Enquiry",
      phone: "9876543210",
      service: "home-nursing",
      locality: "Baner",
      city: "Pune",
      startDate: "2030-01-15",
      preferredShift: "Flexible",
      careDuration: "weekly",
      language: "mr",
      consent: true,
      requestId: "ab041546-3835-4ec2-bcf9-1dc769264b17",
      website: "",
    };
    const first = await request(app)
      .post("/api/v1/public/inquiries")
      .send(input);
    expect(first.status).toBe(201);
    expect(first.body.data.reference).toMatch(/^ENQ-/);
    const retry = await request(app)
      .post("/api/v1/public/inquiries")
      .send(input);
    expect(retry.body.data.reference).toBe(first.body.data.reference);
    expect(await Inquiry.countDocuments({ requestId: input.requestId })).toBe(
      1,
    );
    expect(
      await Notification.countDocuments({
        userId: owner._id,
        title: "A new care enquiry is ready for review.",
      }),
    ).toBe(1);
  });
  it("rejects invalid mobile numbers, spam and unavailable services", async () => {
    const input = {
      name: "Fictional Enquiry",
      phone: "9876543210",
      service: "home-nursing",
      locality: "Baner",
      consent: true,
    };
    for (const invalid of [
      { phone: "1234567890" },
      { website: "spam.example" },
      { service: "unpublished-service" },
    ]) {
      expect(
        (
          await request(app)
            .post("/api/v1/public/inquiries")
            .send({ ...input, ...invalid })
        ).status,
      ).toBe(400);
    }
  });
  it("protects enquiry records and allows audited owner follow-up", async () => {
    expect((await alice.get("/api/v1/admin/inquiries")).status).toBe(403);
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({ email: owner.email, password: "not-used-in-production" });
    const rows = await agent.get(
      "/api/v1/admin/inquiries?search=Fictional%20Enquiry",
    );
    expect(rows.status).toBe(200);
    const inquiry = rows.body.data[0];
    expect(inquiry).toBeTruthy();
    const updated = await agent
      .patch(`/api/v1/admin/inquiries/${inquiry._id}`)
      .send({
        status: "follow-up",
        assignedTo: String(owner._id),
        note: "Fictional follow-up only",
      });
    expect(updated.status).toBe(200);
    expect(updated.body.data.notes[0].text).toBe("Fictional follow-up only");
    expect(
      (await agent.get("/api/v1/admin/inquiry-analytics")).body.data.total,
    ).toBe(1);
    const csv = await agent.get("/api/v1/admin/inquiries-export");
    expect(csv.status).toBe(200);
    expect(csv.text).not.toContain("9876543210");
    expect(csv.text).not.toContain("Fictional follow-up only");
  });
  it("keeps content drafts private and restricts marketing image uploads", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: owner.email, password: "not-used-in-production" });
    expect((await alice.post("/api/v1/admin/content").send({})).status).toBe(
      403,
    );
    expect(
      (
        await agent.post("/api/v1/admin/media").send({
          base64: Buffer.from("<svg>not a photograph</svg>").toString("base64"),
          alt: { en: "Test", hi: "परीक्षण", mr: "चाचणी" },
          illustrative: true,
          consent: true,
        })
      ).status,
    ).toBe(400);
    const draft = await agent.post("/api/v1/admin/content").send({
      kind: "faq",
      slug: "fictional-faq",
      title: {
        en: "Fictional question",
        hi: "परीक्षण प्रश्न",
        mr: "चाचणी प्रश्न",
      },
      body: {
        en: "Fictional answer",
        hi: "परीक्षण उत्तर",
        mr: "चाचणी उत्तर",
      },
      published: false,
      approved: false,
      sortOrder: 0,
    });
    expect(draft.status).toBe(201);
    expect(
      (await request(app).get("/api/v1/public/content")).body.data,
    ).toHaveLength(0);
    const image = await agent.post("/api/v1/admin/media").send({
      base64:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jU0cAAAAASUVORK5CYII=",
      alt: { en: "Fictional image", hi: "परीक्षण चित्र", mr: "चाचणी चित्र" },
      illustrative: true,
      consent: true,
    });
    expect(image.status).toBe(201);
    expect(
      (await request(app).get(`/api/v1/public/media/${image.body.data.id}`))
        .headers["content-type"],
    ).toContain("image/png");
    const {
      _id: contentId,
      createdAt: _created,
      updatedAt: _updated,
      __v: _version,
      ...editable
    } = draft.body.data;
    void _created;
    void _updated;
    void _version;
    expect(
      (
        await agent.patch(`/api/v1/admin/content/${contentId}`).send({
          ...editable,
          published: true,
          approved: true,
          imageId: image.body.data.id,
        })
      ).status,
    ).toBe(200);
    const published = (await request(app).get("/api/v1/public/content")).body
      .data;
    expect(published[0].title.mr).toBe("चाचणी प्रश्न");
    expect(published[0].imageId.data).toBeUndefined();
    await Media.findByIdAndDelete(image.body.data.id);
    await Content.findByIdAndDelete(draft.body.data._id);
  });
  it("creates unpublished services and prevents duplicate published service photos", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: owner.email, password: "not-used-in-production" });
    const draft = await agent.post("/api/v1/admin/services").send({
      slug: "physiotherapy",
      name: "Fictional physiotherapy",
      tag: "TEST",
      summary: "Fictional service summary only",
      description: "Fictional service details for isolated tests only",
      includes: ["Fictional activity"],
      excludes: ["Emergency treatment"],
      clinical: true,
      requiredQualification: "physiotherapist",
      image: "physiotherapy",
    });
    expect(draft.status).toBe(201);
    expect(draft.body.data.active).toBe(false);
    expect(draft.body.data.requiredQualification).toBe("physiotherapist");
    const edited = await agent
      .patch(`/api/v1/admin/services/${draft.body.data._id}`)
      .send({
        image: "physiotherapy",
        sortOrder: 3,
        featured: true,
        seoTitle: "Fictional service title",
      });
    expect(edited.status).toBe(200);
    expect(edited.body.data.seoTitle).toBe("Fictional service title");
    expect(
      (await request(app).get("/api/v1/services/physiotherapy")).status,
    ).toBe(404);
    expect(
      (
        await agent
          .patch(`/api/v1/admin/services/${draft.body.data._id}`)
          .send({ active: true, image: "home-nursing" })
      ).status,
    ).toBe(400);
    expect(
      (
        await agent
          .patch(`/api/v1/admin/services/${draft.body.data._id}`)
          .send({ active: true, image: "orthopedic-care" })
      ).status,
    ).toBe(200);
    await Service.findByIdAndDelete(draft.body.data._id);
  });
  it("requires a closed enquiry and owner retention review before redaction", async () => {
    const inquiry = await Inquiry.findOne({ name: "Fictional Enquiry" });
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: owner.email, password: "not-used-in-production" });
    const input = {
      reason: "Fictional verified retention request",
      confirmed: true,
    };
    expect(
      (
        await agent
          .post(`/api/v1/admin/inquiries/${inquiry._id}/redact`)
          .send(input)
      ).status,
    ).toBe(409);
    await agent
      .patch(`/api/v1/admin/inquiries/${inquiry._id}`)
      .send({ status: "closed" });
    const redacted = await agent
      .post(`/api/v1/admin/inquiries/${inquiry._id}/redact`)
      .send(input);
    expect(redacted.status).toBe(200);
    expect(redacted.body.data.phone).toBe("redacted");
    expect(redacted.body.data.notes).toHaveLength(0);
    expect(
      await Audit.exists({
        action: "inquiry.redacted",
        resource: String(inquiry._id),
      }),
    ).toBeTruthy();
  });
  it("allows public browsing", async () => {
    expect((await request(app).get("/api/v1/services")).body.data).toHaveLength(
      services.length,
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
  it("allows preflight requests from any frontend origin with cookies", async () => {
    for (const frontend of [
      "https://atharv-enterprises-8uv.pages.dev",
      "https://another-frontend.example.test",
    ]) {
      const response = await request(app)
        .options("/api/v1/auth/login")
        .set("Origin", frontend)
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "content-type");
      expect(response.status).toBe(204);
      expect(response.headers["access-control-allow-origin"]).toBe(frontend);
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
      expect(response.headers.vary).toContain("Origin");
    }
  });
  it("keeps authentication required for mutations from other origins", async () => {
    expect(
      (
        await request(app)
          .post("/api/v1/portal/bookings")
          .set("Origin", "https://untrusted.test")
          .send({})
      ).status,
    ).toBe(401);
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
