# Deployment and troubleshooting

For separate Render services, see the [step-by-step Render guide](render-deployment.md).

Use a Node 24 LTS process behind a TLS reverse proxy and a MongoDB replica set. `npm run build` generates `dist` and `dist-server`; `npm start` uses the compiled server. The server listens on `0.0.0.0` and the host-provided `PORT` (4000 by default). In production it trusts one immediate reverse proxy. Local development helpers still bind to loopback.

For split hosting, set the frontend build's `VITE_API_ORIGIN` and the backend's exact `CLIENT_URL`. Separate `onrender.com` origins require production Secure cookies with `COOKIE_SAME_SITE=none`, subject to browser third-party-cookie restrictions. Same-site custom HTTPS domains (such as `www.example.com` and `api.example.com`) allow the default `strict` cookies and are recommended for reliable login. Same-origin deployment remains supported when `VITE_API_ORIGIN` is unset.

Set `CLIENT_URL` to the exact public HTTPS origin. Secrets belong in the host's secret manager. Set a long unique JWT secret; rotating it signs out active JWTs. Protect database network access and use a dedicated authenticated TLS user. Do not expose development Compose MongoDB to the public internet.

Set verified `BUSINESS_PHONE`, `BUSINESS_EMAIL`, `BUSINESS_WHATSAPP` only when approved. Current UI exposes verified phone/email; WhatsApp messaging is not implemented. Set `EMAIL_API_KEY` and `EMAIL_FROM` for Resend. Generic portal notifications retry up to three times; inspect delivery records. Provider sender/domain setup must be completed externally.

## Backup and operations

Use encrypted managed snapshots or a scheduled authenticated `mongodump`; store backups outside the server with restricted access and retention. Restore into a separate database, verify counts, indexes, agreements and representative ownership checks before any production restore. Record an actual restore exercise; none was possible here. Configure monitoring for API errors, database readiness, failed notification delivery and disk growth. Audit/session/notification collections need approved retention jobs before long-term production use.

## Common failures

- PowerShell blocks `npm.ps1`: use `npm.cmd`, without changing execution policy.
- Transactions require a replica set: use the supplied development Compose config or Atlas. Do not bypass transaction checks.
- Origin rejection/cookies missing: use the exact `CLIENT_URL` origin. Development uses `127.0.0.1`, not `localhost`.
- API startup fails: check MongoDB reachability and required environment validation. The server intentionally fails rather than silently storing healthcare records in memory.
- Test binary download blocked: allow the `mongodb-memory-server` download or provide an approved `MONGOMS_SYSTEM_BINARY`. Do not report database tests as passed if setup failed.
- Password recovery email absent: configure the provider; there is no insecure token-printing fallback.
- Profile approval fails: the caregiver must accept their engagement agreement; a nurse needs valid credentials.
- Assignment rejected: check service/locality eligibility, current agreements, billing, working-hour limits, rest conflicts and unresolved leave requests.
- Paid status alone is not bank verification: reconcile external funds before recording an offline receipt.
