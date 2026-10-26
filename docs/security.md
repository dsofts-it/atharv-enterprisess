# Security notes

Passwords use Argon2id. Access JWTs expire after 15 minutes, are restricted to HS256/issuer, and refer to a live, non-revoked database session. Refresh cookies contain random opaque tokens; only their hashes are stored. Refresh uses atomic compare-and-rotate. Session expiration is checked on every protected request; logout, disabled accounts and revocation take effect immediately. Password reset tokens expire in 30 minutes and are one-use.

HttpOnly, SameSite Strict cookies are Secure in production. All mutations enforce the explicit configured Origin, preventing cross-site cookie writes; no arbitrary-origin CORS is enabled. TLS and same-origin deployment are required. XSS still requires defense in depth: React encoding, Helmet CSP, no raw HTML insertion and dependency updates.

No sensitive fields are written to request logs. Audit events deliberately omit care notes, secrets, full contact data and payment credentials. The app has no audit-edit/delete API. Production database credentials should further restrict audit updates/deletion; application-only immutability is not a defense against database administrators.

No uploads or public document URLs are provided. PDFs are generated behind subject/finance authorization. Caregiver contacts are not included in client summaries. The original Documents directory is not served. Finance users cannot list all health records; coordinator and caregiver data are scoped. Family sharing is not implemented, so no relationship is inferred from surname or email domain.

Before production: review multi-process rate limiting, operational concurrency edges, log retention, encrypted backups, least-privilege database access, session/recovery retention jobs, privileged MFA, security headers at the proxy, consent notices and incident response. No default production credentials, automatic penalties, continuous location tracking or hidden monitoring are included.

Reference: [Express production security](https://expressjs.com/advanced/best-practice-security/) and [MongoDB transaction requirements](https://www.mongodb.com/docs/manual/core/transactions/).
