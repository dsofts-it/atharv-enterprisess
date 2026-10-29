import mongoose, { Schema } from "mongoose";
const str = { type: String, required: true };
const ref = { type: Schema.Types.ObjectId, ref: "User", required: true };
const model = (
  name: string,
  fields: Record<string, any>,
  indexes: Record<string, any>[] = [],
): any => {
  const schema = new Schema(fields, { timestamps: true, strict: "throw" });
  for (const index of indexes) schema.index(index);
  return mongoose.models[name] || mongoose.model(name, schema);
};
export const User = model("User", {
  name: str,
  email: { ...str, unique: true },
  passwordHash: str,
  role: {
    type: String,
    enum: [
      "owner",
      "operations",
      "coordinator",
      "caregiver",
      "client",
      "accountant",
    ],
    default: "client",
  },
  active: { type: Boolean, default: true },
  verified: { type: Boolean, default: false },
  lockUntil: Date,
  failures: { type: Number, default: 0 },
  scheduleVersion: { type: Number, default: 0 },
});
export const Session = model("Session", {
  userId: ref,
  tokenHash: { ...str, unique: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
});
export const Recovery = model("Recovery", {
  userId: ref,
  tokenHash: { ...str, unique: true },
  purpose: { type: String, enum: ["reset", "verify"], required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});
export const Service = model("Service", {
  slug: { ...str, unique: true },
  name: str,
  tag: str,
  summary: str,
  description: str,
  includes: [String],
  excludes: [String],
  clinical: Boolean,
  requiredQualification: { type: String, enum: ["nurse", "physiotherapist"] },
  icon: String,
  image: String,
  sortOrder: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  seoTitle: String,
  seoDescription: String,
  translations: {
    hi: { name: String, summary: String, description: String },
    mr: { name: String, summary: String, description: String },
  },
  active: { type: Boolean, default: true },
  ratePaise: { type: Number, min: 0 },
  rateUnit: {
    type: String,
    enum: ["visit", "hour", "shift", "day", "week", "month"],
  },
});
export const Inquiry = model("Inquiry", {
  name: str,
  email: String,
  phone: str,
  service: str,
  locality: str,
  consent: { type: Boolean, required: true },
  reference: { type: String, unique: true, sparse: true },
  requestId: { type: String, unique: true, sparse: true },
  city: String,
  patientAge: Number,
  startDate: String,
  careDuration: String,
  preferredShift: String,
  requirements: String,
  language: String,
  redactedAt: Date,
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  notes: [{ text: String, authorId: Schema.Types.ObjectId, createdAt: Date }],
  status: {
    type: String,
    enum: [
      "new",
      "reviewed",
      "contacted",
      "follow-up",
      "confirmed",
      "closed",
      "cancelled",
    ],
    default: "new",
  },
});
export const Booking = model(
  "Booking",
  {
    reference: { ...str, unique: true },
    clientId: ref,
    coordinatorId: { type: Schema.Types.ObjectId, ref: "User" },
    service: str,
    preferredName: str,
    locality: str,
    startDate: str,
    shift: str,
    duration: Number,
    instructions: String,
    consentedAt: Date,
    status: {
      type: String,
      enum: [
        "inquiry",
        "assessment",
        "quote",
        "agreement",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "rejected",
      ],
      default: "inquiry",
    },
    quotePaise: { type: Number, min: 1 },
    quoteDescription: String,
    billingApproved: { type: Boolean, default: false },
    version: { type: Number, default: 0 },
  },
  [{ clientId: 1, createdAt: -1 }],
);
export const Caregiver = model("Caregiver", {
  userId: { ...ref, unique: true },
  displayName: str,
  qualification: {
    type: String,
    enum: ["nurse", "attendant", "physiotherapist"],
    required: true,
  },
  services: [String],
  localities: [String],
  languages: [String],
  status: {
    type: String,
    enum: ["pending", "approved", "suspended", "inactive"],
    default: "pending",
  },
  credentialExpiry: Date,
  verifiedAt: Date,
  engagement: {
    type: String,
    enum: ["employee", "contractor"],
    default: "employee",
  },
  maxHours: { type: Number, min: 1, max: 12, default: 12 },
  restHours: { type: Number, min: 0, max: 24, default: 8 },
});
export const Agreement = model(
  "Agreement",
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    userId: ref,
    kind: {
      type: String,
      enum: ["client", "employee", "contractor"],
      required: true,
    },
    version: str,
    text: str,
    hash: str,
    acceptedAt: Date,
    acceptedName: String,
    expiresAt: Date,
    superseded: { type: Boolean, default: false },
  },
  [{ userId: 1, bookingId: 1 }],
);
export const Assignment = model(
  "Assignment",
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    clientId: ref,
    caregiverId: ref,
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "scheduled",
    },
    instructions: String,
  },
  [{ caregiverId: 1, start: 1, end: 1 }, { clientId: 1 }],
);
export const Shift = model(
  "Shift",
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    clientId: ref,
    caregiverId: ref,
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "started", "completed", "cancelled"],
      default: "scheduled",
    },
    actualStart: Date,
    actualEnd: Date,
    notes: String,
    tasks: [String],
  },
  [{ caregiverId: 1, start: 1 }],
);
export const Invoice = model("Invoice", {
  number: { ...str, unique: true },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  clientId: ref,
  description: str,
  quantity: { type: Number, min: 1 },
  unitPaise: { type: Number, min: 1 },
  taxBps: { type: Number, min: 0, max: 10000 },
  subtotalPaise: Number,
  taxPaise: Number,
  totalPaise: Number,
  paidPaise: { type: Number, default: 0 },
  refundedPaise: { type: Number, default: 0 },
  dueDate: str,
  status: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid",
  },
  version: { type: Number, default: 0 },
});
export const Payment = model("Payment", {
  invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
  amountPaise: { type: Number, min: 1, required: true },
  kind: { type: String, enum: ["payment", "refund"], required: true },
  reference: { ...str, unique: true },
  reason: str,
  actorId: ref,
});
export const Ticket = model(
  "Ticket",
  {
    userId: ref,
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    type: str,
    message: str,
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved"],
      default: "open",
    },
    resolution: String,
  },
  [{ userId: 1, createdAt: -1 }],
);
export const Notification = model("Notification", {
  userId: ref,
  title: str,
  read: { type: Boolean, default: false },
  emailStatus: {
    type: String,
    enum: ["in-app-only", "pending", "sent", "failed"],
    default: "in-app-only",
  },
  attempts: { type: Number, default: 0 },
  deliveryKey: { ...str, unique: true },
});
export const Audit = model(
  "Audit",
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    action: str,
    resource: str,
    outcome: { type: String, default: "success" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  [{ createdAt: -1 }],
);
export const Content = model("Content", {
  kind: {
    type: String,
    enum: [
      "banner",
      "about",
      "faq",
      "testimonial",
      "gallery",
      "video",
      "blog",
      "contact",
    ],
    required: true,
  },
  slug: { ...str, unique: true },
  title: { en: str, hi: str, mr: str },
  body: { en: String, hi: String, mr: String },
  imageId: { type: Schema.Types.ObjectId, ref: "Media" },
  externalUrl: String,
  approved: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});
export const Media = model("Media", {
  data: { type: Buffer, required: true },
  contentType: str,
  alt: { en: str, hi: str, mr: str },
  illustrative: { type: Boolean, default: false },
});
export const BusinessSettings = model("BusinessSettings", {
  key: { ...str, unique: true },
  phone: String,
  email: String,
  whatsapp: String,
  location: String,
  address: String,
  mapUrl: String,
});
export const models = {
  BusinessSettings,
  Content,
  Media,
  User,
  Session,
  Recovery,
  Service,
  Inquiry,
  Booking,
  Caregiver,
  Agreement,
  Assignment,
  Shift,
  Invoice,
  Payment,
  Ticket,
  Notification,
  Audit,
};
