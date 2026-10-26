import mongoose from "mongoose";
import argon2 from "argon2";
import { registerSchema } from "../../shared/schemas.js";
import { config } from "./config.js";
import { User } from "./models.js";
const d = registerSchema.parse({
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});
await mongoose.connect(config.MONGODB_URI);
if (await User.exists({ role: "owner" }))
  throw new Error(
    "An owner already exists; use a documented administrator handover",
  );
await User.init();
await User.create({
  name: d.name,
  email: d.email,
  passwordHash: await argon2.hash(d.password),
  role: "owner",
  verified: true,
});
console.log("Owner created. Remove ADMIN_PASSWORD from your environment.");
await mongoose.disconnect();
