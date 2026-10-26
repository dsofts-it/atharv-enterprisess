# REST API

Redesign additions: `GET /portal/caregiver-profile` is restricted to the signed-in caregiver and returns only selected profile fields. Authorized assignment summaries also include the relevant booking’s preferred name, locality and service. No client-contact directory or additional role privilege is introduced.

All paths start `/api/v1`. Success: `{ "data": ... }`; failure: `{ "error": { "message": ... } }`. Mutations require an `Origin` exactly matching `CLIENT_URL`, even in CLI tests. Use JSON content type. Browser sessions use HttpOnly cookies. Lists currently return at most 100 records (billing export: 1,000); cursor pagination remains outstanding.

| Routes                                                                                                                 | Access                                                       |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| GET `/health`, `/services`, `/services/:slug`, `/faqs`, `/public/settings`                                             | Public                                                       |
| POST `/public/inquiries`, `/public/contact`                                                                            | Public, strict minimal schema and consent                    |
| POST `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` | Auth flow; rate limited                                      |
| GET `/auth/me`; POST `/auth/revoke-sessions`                                                                           | Authenticated                                                |
| GET `/portal/bookings`, `/portal/bookings/:id`                                                                         | Owner/operations, assigned coordinator or owning client      |
| POST `/portal/bookings`                                                                                                | Client only; server chooses client and status                |
| GET `/portal/assignments`, `/portal/shifts`                                                                            | Scoped to ownership/assignment/coordinator                   |
| POST `/portal/shifts/:id/start`, `/portal/shifts/:id/complete`                                                         | Assigned caregiver only; schedule/state checks               |
| GET `/portal/agreements`, `/portal/agreements/:id/pdf`; POST `/portal/agreements/:id/accept`                           | Document subject only                                        |
| GET `/portal/invoices`, `/portal/invoices/:id/pdf`                                                                     | Owner/accountant or owning client                            |
| GET/POST `/portal/tickets`                                                                                             | Own requests, optional owned booking                         |
| GET `/portal/notifications`; POST `/portal/notifications/:id/read`                                                     | Recipient only                                               |
| PATCH `/portal/profile`; POST `/portal/deactivate`                                                                     | Own profile; owner excluded from self-deactivation           |
| GET `/admin/dashboard`                                                                                                 | Owner/operations/accountant; finance fields separately gated |
| GET/PATCH `/admin/inquiries[/:id]`, `/admin/bookings[/:id]`                                                            | Owner/operations                                             |
| POST `/admin/assignments`; PATCH `/admin/assignments/:id`                                                              | Owner/operations; cancellation only before attendance        |
| GET `/admin/caregivers`                                                                                                | Owner/operations                                             |
| POST/PATCH `/admin/caregivers[/:id]`                                                                                   | Owner only                                                   |
| GET/POST `/admin/users`; PATCH `/admin/users/:id`                                                                      | Owner only; no owner promotion through HTTP                  |
| GET `/admin/clients`, `/admin/shifts`, `/admin/tickets`; PATCH `/admin/tickets/:id`                                    | Owner/operations                                             |
| GET/POST `/admin/invoices`; POST `/admin/invoices/:id/payments`; GET `/admin/reports`                                  | Owner/accountant; refunds owner only                         |
| GET `/admin/audit-logs`; PATCH `/admin/services/:id`                                                                   | Owner only                                                   |

`server/src/workflows.ts` contains schemas for assignment and finance commands. IDs are references, not authorization. Server ownership filters remain authoritative. There are no endpoints that accept a browser-supplied payment success state or arbitrary role registration.
