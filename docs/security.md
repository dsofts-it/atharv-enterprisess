# Security notes

Passwords use Argon2id. Access JWTs expire after 15 minutes, are restricted to HS256/issuer, and refer to a live, non-revoked database session. Refresh cookies contain random opaque tokens; only their hashes are stored. Refresh uses atomic compare-and-rotate. Session expiration is checked on every protected request; logout, disabled accounts and revocation take effect immediately. Password reset tokens expire in 30 minutes and are one-use.

Production cookies are HttpOnly and Secure. `COOKIE_SAME_SITE` is explicitly configured: `strict` for same-site custom domains, `none` for cross-site preview deployments. Browser third-party-cookie restrictions can still affect unrelated Pages/Render domains.

`CORS_ALLOWED_ORIGINS=*` preserves the all-domain behavior explicitly requested earlier. It reflects the caller's origin with credentials and does not provide cross-site request forgery protection. Before processing real patient records, configure comma-separated exact trusted frontend origins. Restricted mode applies both CORS restrictions and mutation-origin checks. Wildcard mode is a documented residual risk, not a claim that arbitrary credentialed origins are safe.

React text encoding, strict Zod schemas, request-size limits, rate limiting and Helmet remain enabled. Public enquiries validate Indian mobile format, consent, available service and expanded preferences; a honeypot and unique retry key reduce spam and duplicate submissions. Authentication still governs protected records regardless of CORS mode. The general API limiter remains 180 requests/minute in production; only isolated test mode permits more requests for multi-viewport regressions. Enquiry and authentication limits remain separate.

Audit events omit health notes, secrets and full contact data. Enquiry summaries can be exported only by owner/operations; CSV excludes phone, email, patient age, requirements and follow-up notes. Owner-only redaction is available for closed/cancelled enquiries after a recorded retention review. It preserves service/reference/status and an audit record. It does not erase backups, invoices or legally retained records.

Marketing image uploads are owner-only, bounded to 1.5 MB and checked for PNG/JPEG/WebP signatures. SVG and HTML are rejected. Three-language alt text and an explicit rights/consent acknowledgement are required. Marketing files are public assets stored in MongoDB, not private patient uploads. Metadata stripping, full decoding/re-encoding and malware scanning remain hardening work. Content renders as text, not raw HTML. Publication requires owner approval; draft content is excluded from the public API.

PDFs remain behind subject/finance authorization. Caregiver contacts are excluded from client summaries. The original Documents directory is not served. Staff and family records remain scoped. Financial operations and schedule assignments retain their transactional checks. Clinical assignment checks enforce the required nurse/physiotherapist role and credential expiry; disabled services cannot be assigned.

Cloudflare Pages receives `_headers` for content type, referrer, framing, permissions and content-security policy. The deployment must still verify those headers, HTTPS, trusted proxy behavior, exact origins and cookie handling.

Before production: review shared multi-process rate limiting, operational concurrency edges, log retention, encrypted backups, least-privilege database access, session/recovery expiry cleanup, privileged MFA, operational consent notices and incident response. No automatic claim of Indian legal compliance or WCAG conformance is made. The draft policy text in English/Hindi/Marathi requires business/legal review.

See [healthcare upgrade audit](healthcare-upgrade-audit.md) and [Cloudflare/Render deployment](cloudflare-render-healthcare.md) for remaining configuration and verification.
