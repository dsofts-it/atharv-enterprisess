import { z } from "zod";
export const email = z.string().trim().email().toLowerCase().max(200);
export const password = z.string().min(12).max(128);
export const registerSchema = z
  .object({ name: z.string().trim().min(2).max(100), email, password })
  .strict();
export const loginSchema = z
  .object({ email, password: z.string().min(1).max(128) })
  .strict();
export const inquirySchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.union([email, z.literal("")]).optional(),
    phone: z
      .string()
      .trim()
      .regex(
        /^(?:\+91[ -]?)?[6-9]\d{9}$/,
        "Enter a valid 10-digit Indian mobile number",
      ),
    service: z.string().max(80),
    locality: z.string().min(2).max(100),
    consent: z.literal(true),
    city: z.string().trim().min(2).max(80).optional(),
    patientAge: z.number().int().min(0).max(120).optional(),
    startDate: z.string().date().optional(),
    careDuration: z
      .enum(["visit", "daily", "weekly", "monthly", "long-term"])
      .optional(),
    preferredShift: z
      .enum(["Day", "Night", "12-hour", "24-hour coverage", "Flexible"])
      .optional(),
    requirements: z.string().trim().max(1000).optional(),
    language: z.enum(["en", "hi", "mr"]).optional(),
    website: z.string().max(0).optional(),
    requestId: z.string().uuid().optional(),
  })
  .strict()
  .superRefine((data, context) => {
    // Keep the existing compact careers form compatible; expanded care forms include city.
    if (data.city && !data.startDate)
      context.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Choose a preferred start date",
      });
  });
export const bookingSchema = z
  .object({
    service: z.string().max(80),
    preferredName: z.string().trim().min(1).max(80),
    locality: z.string().min(2).max(100),
    startDate: z.string().date(),
    shift: z.enum(["Day", "Night", "12-hour", "24-hour coverage"]),
    duration: z.number().int().min(1).max(365),
    instructions: z.string().max(1500).default(""),
    consent: z.literal(true),
  })
  .strict();
export const supportSchema = z
  .object({
    type: z.enum([
      "Support",
      "Complaint",
      "Replacement",
      "Extension",
      "Cancellation",
      "Transfer",
      "Incident",
      "Leave",
      "Privacy",
    ]),
    message: z.string().trim().min(10).max(2000),
    bookingId: z.string().optional(),
  })
  .strict();
