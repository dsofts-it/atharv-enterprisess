import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { z } from "zod";
import { config } from "./config.js";
import { User, Session, Recovery } from "./models.js";
import {
  registerSchema,
  loginSchema,
  email,
  password,
} from "../../shared/schemas.js";
import {
  wrap,
  ok,
  assert,
  hash,
  token,
  audit,
  publicUser,
  notify,
} from "./lib.js";
// Express request context uses the framework declaration-merging namespace.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: any;
      sessionId?: string;
    }
  }
}
const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: config.COOKIE_SAME_SITE,
  path: "/api/v1",
};
function cookies(res: Response, user: any, session: any, refresh: string) {
  res.cookie(
    "access",
    jwt.sign(
      { sub: String(user._id), sid: String(session._id) },
      config.JWT_ACCESS_SECRET,
      { expiresIn: "15m", algorithm: "HS256", issuer: "atharv" },
    ),
    { ...cookieOptions, maxAge: 15 * 60 * 1000 },
  );
  res.cookie("refresh", refresh, { ...cookieOptions, maxAge: 7 * 86400000 });
}
async function createSession(user: any, res: Response) {
  const raw = token();
  const session = await Session.create({
    userId: user._id,
    tokenHash: hash(raw),
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  cookies(res, user, session, raw);
}
export const authenticate = wrap(
  async (req: Request, _res: Response, next: NextFunction) => {
    assert(req.cookies.access, 401, "Please sign in to continue");
    let payload: any;
    try {
      payload = jwt.verify(req.cookies.access, config.JWT_ACCESS_SECRET, {
        algorithms: ["HS256"],
        issuer: "atharv",
      });
    } catch {
      assert(false, 401, "Your session has expired. Please sign in again");
    }
    const session = await Session.findOne({
      _id: payload.sid,
      userId: payload.sub,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });
    assert(session, 401, "Session is no longer valid");
    const user = await User.findOne({ _id: payload.sub, active: true });
    assert(user, 401, "Account is unavailable");
    req.user = user;
    req.sessionId = payload.sid;
    next();
  },
);
export const roles =
  (...allowed: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      assert(
        req.user && allowed.includes(req.user.role),
        403,
        "You do not have permission for this action",
      );
      next();
    } catch (e) {
      next(e);
    }
  };
export const auth = Router();
auth.post(
  "/register",
  wrap(async (req, res) => {
    const data = registerSchema.parse(req.body);
    assert(
      !(await User.exists({ email: data.email })),
      409,
      "This email cannot be registered. Try signing in or resetting your password.",
    );
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: await argon2.hash(data.password, { type: argon2.argon2id }),
    });
    await createSession(user, res);
    await audit(user._id, "account.registered", String(user._id));
    ok(res, publicUser(user), 201);
  }),
);
auth.post(
  "/login",
  wrap(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email, active: true });
    assert(
      !user?.lockUntil || user.lockUntil < Date.now(),
      429,
      "Please wait before trying again",
    );
    const valid =
      user && (await argon2.verify(user.passwordHash, data.password));
    if (!valid) {
      if (user)
        await User.updateOne(
          { _id: user._id },
          {
            $inc: { failures: 1 },
            ...(user.failures >= 4
              ? { $set: { lockUntil: new Date(Date.now() + 15 * 60000) } }
              : {}),
          },
        );
      assert(false, 401, "Email or password is incorrect");
    }
    await User.updateOne(
      { _id: user._id },
      { $set: { failures: 0 }, $unset: { lockUntil: 1 } },
    );
    await createSession(user, res);
    await audit(user._id, "session.login", String(user._id));
    ok(res, publicUser(user));
  }),
);
auth.post(
  "/refresh",
  wrap(async (req, res) => {
    const raw = token();
    const session = await Session.findOneAndUpdate(
      {
        tokenHash: hash(req.cookies.refresh || ""),
        revoked: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { tokenHash: hash(raw) } },
      { returnDocument: "after" },
    );
    assert(session, 401, "Please sign in again");
    const user = await User.findOne({ _id: session.userId, active: true });
    assert(user, 401, "Account unavailable");
    cookies(res, user, session, raw);
    ok(res, publicUser(user));
  }),
);
auth.post(
  "/logout",
  wrap(async (req, res) => {
    await Session.updateOne(
      { tokenHash: hash(req.cookies.refresh || "") },
      { $set: { revoked: true } },
    );
    res.clearCookie("access", cookieOptions);
    res.clearCookie("refresh", cookieOptions);
    ok(res, { signedOut: true });
  }),
);
auth.get("/me", authenticate, (req, res) => ok(res, publicUser(req.user)));
auth.post(
  "/revoke-sessions",
  authenticate,
  wrap(async (req, res) => {
    await Session.updateMany(
      { userId: req.user._id },
      { $set: { revoked: true } },
    );
    await audit(req.user._id, "sessions.revoked", String(req.user._id));
    ok(res, { revoked: true });
  }),
);
auth.post(
  "/forgot-password",
  wrap(async (req, res) => {
    const address = email.parse(req.body.email);
    const user = await User.findOne({ email: address, active: true });
    if (user) {
      const raw = token();
      await Recovery.create({
        userId: user._id,
        tokenHash: hash(raw),
        purpose: "reset",
        expiresAt: new Date(Date.now() + 30 * 60000),
      });
      if (config.EMAIL_API_KEY && config.EMAIL_FROM) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.EMAIL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: config.EMAIL_FROM,
            to: user.email,
            subject: "Reset your Atharv password",
            text: `Open ${config.CLIENT_URL}/reset-password#${raw} within 30 minutes. If you did not request this, ignore it.`,
          }),
        });
      } else {
        await notify(
          user._id,
          "Password recovery requested. Email delivery is not configured; contact the administrator.",
        );
      }
    }
    ok(res, {
      message:
        "If an account exists and email is configured, a recovery link will be sent.",
    });
  }),
);
auth.post(
  "/reset-password",
  wrap(async (req, res) => {
    const data = z
      .object({ token: z.string().min(40), password })
      .strict()
      .parse(req.body);
    const recovery = await Recovery.findOneAndUpdate(
      {
        tokenHash: hash(data.token),
        purpose: "reset",
        used: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { used: true } },
      { returnDocument: "after" },
    );
    assert(recovery, 400, "Recovery link is invalid or expired");
    await User.updateOne(
      { _id: recovery.userId },
      {
        $set: { passwordHash: await argon2.hash(data.password), failures: 0 },
        $unset: { lockUntil: 1 },
      },
    );
    await Session.updateMany(
      { userId: recovery.userId },
      { $set: { revoked: true } },
    );
    await audit(recovery.userId, "password.reset", String(recovery.userId));
    ok(res, { reset: true });
  }),
);
