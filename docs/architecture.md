# Architecture and database

React 19, Vite, TypeScript, Tailwind, React Router, Motion, Lucide, React Hook Form/Zod, TanStack Query, Sonner and Recharts. Express, TypeScript, Mongoose, Argon2id, JWT, Helmet and structured Pino logging. Package lock pins resolved versions; install using `npm ci`.

The original assets remain in `Photos`. Shared catalog and input schemas live in `shared`. Backend modules separate authentication, models, HTTP routes, transactional domain workflows and PDFs. Public screens, request forms and the lazy-loaded portal are in `client/src`.

## Collections

| Collection    | Relationships and purpose                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| users         | Unique normalized email, role, active state, password hash, login lock and per-caregiver schedule version    |
| sessions      | User, unique refresh hash, expiry, revocation                                                                |
| recoveries    | User, purpose, one-time token hash, expiry                                                                   |
| services      | Unique slug, qualified scope, inclusions, exclusions, optional pricing                                       |
| inquiries     | Minimal public contact consent and triage status                                                             |
| bookings      | Unique reference, client, optional coordinator, care request, approved quote, state and billing gate         |
| caregivers    | Unique user reference, approved display name, qualification, eligibility, expiry, engagement and rest limits |
| agreements    | User/booking, immutable text snapshot, version/hash, expiry and explicit acceptance                          |
| assignments   | Booking/client/caregiver references and scheduled service interval                                           |
| shifts        | Assignment/booking/client/caregiver, planned vs actual UTC timestamps, tasks and notes                       |
| invoices      | Unique number, booking/client, integer-paise totals, receipts/refunds and due date                           |
| payments      | Invoice, unique reconciliation reference, amount, type, actor and reason                                     |
| tickets       | Requester, optional owned booking, purpose, resolution and review state                                      |
| notifications | Recipient, unique delivery key, read state, email status/retries                                             |
| audits        | Actor, action, resource, minimal metadata, outcome and timestamp                                             |

Schemas reject unknown fields. Booking ownership, schedule and audit indexes support common lookups; unique indexes prevent duplicate email, profile and financial reference records. Dates use UTC; the UI formats service timestamps in Asia/Kolkata. Input schedule controls use the browser timezone; operators should use an India-configured workstation.

## Concurrency

Assignment creation increments the caregiver’s user schedule version inside a transaction before querying conflicts. All assignments use that lock. MongoDB retries write conflicts, then the losing request sees the committed overlapping shift. The booking, assignment, shift, audit and notifications commit together. Finance takes a transactional invoice write lock before validating remaining balances. Staff/caregiver policy edits and cancellation workflows still need more extensive concurrency hardening before multi-node production deployment.

## Agreement and request lifecycle

Inquiry → assessment → quote → agreement → confirmed → active → completed/cancelled. Confirmation requires current client acknowledgment and approved billing. Assignment requires current client and caregiver agreements. Document text and acceptance are retained; no API allows clients to overwrite them. Ordinary acceptance is not described as a qualified digital signature.

Requests for changes and transfers create reviewable tickets. They do not automatically impose penalties, transfer employment or change billing. No surveillance is performed. Software cannot prevent off-platform relationships.
