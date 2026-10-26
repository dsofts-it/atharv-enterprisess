import { randomBytes, createHash } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import pino from "pino";
import { Audit, Notification, User } from "./models.js";
import { config } from "./config.js";
export const log = pino({
  redact: ["password", "token", "email", "instructions"],
});
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const assert = (condition: unknown, status: number, message: string) => {
  if (!condition) throw new HttpError(status, message);
};
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const token = () => randomBytes(40).toString("hex");
export const id = (prefix: string) =>
  `${prefix}-${randomBytes(6).toString("hex").toUpperCase()}`;
export const wrap =
  (fn: (req: Request, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
export const ok = (res: Response, data: any, status = 200) =>
  res.status(status).json({ data });
export async function audit(
  actorId: any,
  action: string,
  resource: string,
  metadata: Record<string, unknown> = {},
  session?: mongoose.ClientSession,
) {
  await Audit.create(
    [{ actorId, action, resource, metadata }],
    session ? { session } : {},
  );
}
export async function notify(
  userId: any,
  title: string,
  deliveryKey = id("NTF"),
  session?: mongoose.ClientSession,
) {
  await Notification.create(
    [
      {
        userId,
        title,
        deliveryKey,
        emailStatus: config.EMAIL_API_KEY ? "pending" : "in-app-only",
      },
    ],
    session ? { session } : {},
  );
}
export async function deliverNotifications() {
  if (!config.EMAIL_API_KEY || !config.EMAIL_FROM) return;
  const pending = await Notification.find({
    emailStatus: { $in: ["pending", "failed"] },
    attempts: { $lt: 3 },
  }).limit(20);
  for (const n of pending) {
    const user = await User.findById(n.userId);
    if (!user) continue;
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.EMAIL_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": n.deliveryKey,
        },
        body: JSON.stringify({
          from: config.EMAIL_FROM,
          to: user.email,
          subject: "An update in your Atharv care portal",
          text: `An update is available. Sign in securely at ${config.CLIENT_URL}/portal. Do not reply with health information.`,
        }),
      });
      n.emailStatus = response.ok ? "sent" : "failed";
    } catch {
      n.emailStatus = "failed";
    }
    n.attempts += 1;
    await n.save();
  }
}
export const publicUser = (u: any) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  verified: u.verified,
});
