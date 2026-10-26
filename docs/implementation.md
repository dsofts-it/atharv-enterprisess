# Implementation record

This is a local React/Vite/TypeScript + Express/Mongoose platform, built in the supplied workspace. The original `Photos/Logo.png` and quotation documents are preserved. Quotation documents were not treated as implementation instructions or business verification.

## Implemented workflows

- Public home, about, six service details, process, FAQ, careers expression of interest, contact and policy pages.
- Validated general inquiry intake; authenticated multi-step care requests; assessment, quote, agreement, confirmation and active-care workflow.
- Cookie authentication; Argon2id; short-lived signed access JWTs; hashed opaque refresh tokens with atomic rotation; revocation; login rate limits and account lockout; recovery provider integration.
- Role checks and ownership/assignment scoping. Operations excludes financial functions; accountant excludes health records; coordinator scope is explicit.
- Owner-created staff accounts, caregiver onboarding and verification, service eligibility, locality, engagement-specific agreements, credential expiry checks for nurses.
- Versioned agreement snapshots with SHA-256, named explicit acceptance, expiry, downloads and audit history.
- Transactional assignment creation, concurrent scheduling protection, working-hour limits, rest periods and pending-leave review gate. One assignment creates one shift; create multiple appropriate shifts for extended coverage.
- Server-validated attendance, task and handover capture, support/change/transfer/leave/privacy requests and human response.
- Invoice arithmetic in integer paise, offline receipt/refund recording, duplicate reference protection, owner-only refunds, PDF invoices and agreements, CSV billing export, operational summary and billing chart.
- In-app notifications; optional Resend delivery with idempotency keys and bounded retry. No sensitive details are sent by email.
- Server-side audit creation with no application edit/delete route; safe error handling, strict schemas, explicit origin checks, Helmet, body size limits, CORS allowlist and no-store private API responses.

## Important assumptions

No verified contact phone, email, street address, price, license, business performance or genuine testimonial was supplied. None is invented. Contact links appear only when environment configuration exists. Service availability and care scope require business confirmation. Pricing begins with a quote; the service editor supports optional configured rates but the public cards do not promise those rates.

Only the service and locality are preserved in session storage during sign-in. Health information, access tokens, roles and financial status are not stored there. Detailed care forms stay in React memory until submitted.

## Remaining work — not complete

This implementation is a working foundation, not acceptance of every item in the master brief or a production certification. The following still need dedicated implementation/review:

- Granular configurable permission sets, revocable authorized-family grants, coordinator assignment UI, and delegated client access.
- Automatic recurring-shift generation, availability calendars, approved leave date intervals, shift swaps, attendance corrections and missed-shift jobs. Current leave requests trigger a conservative review gate for all scheduling until resolved.
- Full care assessments/care-plan module, credential file uploads/private object storage, file scanning, training/history and separate client profile records.
- Strong identity verification, phone verification and optional privileged MFA. Account `verified` is not currently an authorization gate.
- Online payment orders, verified provider webhooks, reconciliation jobs, payment UI and actual money movement. Current finance module records verified offline transactions only.
- Strong electronic signature provider, legally reviewed and business-specific agreement text, template editing/reacceptance UI, and lawful transfer fee configuration. Current draft acknowledgment is not a certified signature.
- SMS/WhatsApp, user notification preferences, reminder/expiry jobs, automated account exports/deletion and retention processing.
- Restricted unusual-pattern review signals dashboard. Support requests support review; no automatic accusation or financial penalty exists.
- Full FAQ/content/settings administration, dedicated report date filtering, cursor pagination (current lists cap at 100), service creation/archival UI and accounting recognition rules.
- Real business onboarding, approved images, clinical governance, legal review, backup/restore exercise, production load testing and assistive-technology audit.

## Implementation checklist

- [x] Inspect workspace and read supplied brief.
- [x] Research care coordination, official framework and technical documentation.
- [x] Build public pages and core backend workflows.
- [x] Connect owner, operations, caregiver and client interfaces.
- [x] Add tests and deployment documentation.
- [ ] Complete all remaining advanced modules above.
- [ ] Configure real production services and business policies.
- [ ] Pass live business acceptance and production security review.
