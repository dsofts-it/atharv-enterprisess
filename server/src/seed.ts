import mongoose from "mongoose";
import { config } from "./config.js";
import { Service } from "./models.js";
import { services } from "../../shared/catalog.js";
if (config.NODE_ENV !== "development")
  throw new Error("Seed is development-only");
await mongoose.connect(config.MONGODB_URI);
for (const s of services)
  await Service.updateOne(
    { slug: s.slug },
    { $setOnInsert: s },
    { upsert: true },
  );
console.log(
  "Service catalog seeded. No invented company statistics or credentials added.",
);
await mongoose.disconnect();
