import mongoose from "mongoose";
import { config } from "./config.js";
import { app } from "./app.js";
import { services } from "../../shared/catalog.js";
import { Service, models } from "./models.js";
import { deliverNotifications, log } from "./lib.js";
await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
await Promise.all(Object.values(models).map((m) => m.init()));
for (const s of services)
  await Service.updateOne(
    { slug: s.slug },
    { $setOnInsert: s },
    { upsert: true },
  );
const server = app.listen(config.PORT, "0.0.0.0", () =>
  log.info({ port: config.PORT }, "Atharv API ready"),
);
const worker = setInterval(
  () =>
    deliverNotifications().catch(() => log.warn("Notification retry failed")),
  60000,
);
worker.unref();
process.on("SIGINT", () => {
  clearInterval(worker);
  server.close(() => void mongoose.disconnect());
});
