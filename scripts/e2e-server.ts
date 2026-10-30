import { MongoMemoryReplSet } from "mongodb-memory-server";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import argon2 from "argon2";
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = randomBytes(48).toString("hex");
process.env.CLIENT_URL = `http://127.0.0.1:${process.env.E2E_CLIENT_PORT || "5174"}`;
process.env.MONGOMS_DOWNLOAD_DIR = resolve(
  "node_modules/.cache/mongodb-memory-server",
);
const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
process.env.MONGODB_URI = repl.getUri();
const mongoose = (await import("mongoose")).default;
await mongoose.connect(process.env.MONGODB_URI);
const { Service, models } = await import("../server/src/models.js");
const { services } = await import("../shared/catalog.js");
await Promise.all(Object.values(models).map((m) => m.init()));
await Service.insertMany(services);
const credentials: Record<string, { email: string; password: string }> = {};
const { User, Caregiver, Booking, Invoice } = models;
for (const role of ["owner", "caregiver", "client", "accountant"]) {
  const password = randomBytes(24).toString("hex");
  const email = `${role}@fictional-e2e.example`;
  const user = await User.create({
    name: `Fictional ${role}`,
    email,
    role,
    passwordHash: await argon2.hash(password),
  });
  credentials[role] = { email, password };
  if (role === "caregiver")
    await Caregiver.create({
      userId: user._id,
      displayName: "Fictional Caregiver",
      qualification: "attendant",
      services: ["elderly-care"],
      localities: ["Baner"],
      languages: ["Marathi"],
      status: "pending",
      engagement: "employee",
    });
}
const client = await User.findOne({ role: "client" });
const booking = await Booking.create({
  clientId: client._id,
  reference: "AE-E2E-FIXTURE",
  service: "elderly-care",
  preferredName: "Fictional Relative",
  locality: "Baner",
  startDate: "2030-01-01",
  shift: "Day",
  duration: 7,
  status: "inquiry",
  consentedAt: new Date(),
});
await Invoice.create({
  number: "INV-FICTIONAL-E2E",
  bookingId: booking._id,
  clientId: client._id,
  description: "Fictional browser test invoice only",
  quantity: 1,
  unitPaise: 100000,
  taxBps: 0,
  subtotalPaise: 100000,
  taxPaise: 0,
  totalPaise: 100000,
  paidPaise: 0,
  dueDate: "2030-01-01",
});
await mkdir(".runtime", { recursive: true });
await writeFile(".runtime/e2e-users.json", JSON.stringify(credentials));
const { app } = await import("../server/src/app.js");
const apiPort = Number(process.env.E2E_API_PORT || "4101");
const server = app.listen(apiPort, "127.0.0.1", () =>
  console.log(`Isolated E2E API ready on ${apiPort}`),
);
const shutdown = () =>
  server.close(async () => {
    await mongoose.disconnect();
    await repl.stop();
    process.exit(0);
  });
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
