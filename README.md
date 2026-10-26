# Atharv Enterprises Nursing & Home Care

For a Render backend Web Service and frontend Static Site, follow the [complete Render deployment guide](docs/render-deployment.md). It includes the exact build settings, Atlas configuration, cookies/custom domains, and first-owner setup for this repository.

The visual redesign includes an illustrated homepage, full portal sign-in, role-specific dashboards and a local asset library. See [redesign notes and asset manifest](docs/redesign.md) for the design, motion, provenance and validation details. Normal startup commands below are unchanged.

The latest [scroll and theme update](docs/scroll-and-theme.md) adds scroll-linked movement on already-loaded content, replaying section entrances, distinct editorial art, and locally served Manrope/DM Sans typography.

## Project location and quick start

All application code and dependencies are in `atharv-care`. The supplied `Documents` and `Photos` folders remain next to it:

```text
Atharv Enterprises/
├── Documents/
├── Photos/
└── atharv-care/
    ├── client/
    ├── server/
    └── package.json
```

Open PowerShell and run:

```powershell
cd "D:\Dsofts Projects\Atharv Enterprises\atharv-care"
npm.cmd run dev:local
```

This starts the backend, frontend and local development MongoDB together. Open **http://127.0.0.1:5173**. The backend runs at **http://127.0.0.1:4000/api/v1**. Press **Ctrl+C** to stop them. Dependencies are already installed; use `npm.cmd ci` if reinstalling them.

To run frontend and backend in separate terminals with your own MongoDB, first follow the environment setup below. Then run `npm.cmd run dev:server` in one terminal and `npm.cmd run dev:client` in another, both from `atharv-care`. Or use `npm.cmd run dev` to start both together with that configured database.

Locally, the application serves `/Photos` from `../Photos`. Deployment also includes a copy of the logo in `public/Photos`, which the API uses as a fallback for PDFs when the original sibling folder is absent. Original supplied folders remain unchanged. `.runtime-recovered` retains a precautionary copy of database files from the relocation; normal development uses `.runtime`.

A responsive care website with an Express/MongoDB operations platform. Uses the supplied Atharv logo, public service discovery, care requests, agreements, caregiver scheduling, attendance, billing and role-specific portals. See [implementation scope and known limitations](docs/implementation.md) before deployment.

## Requirements

Node.js 24 LTS, npm, and a MongoDB replica set (Atlas or self-hosted). Transactions are required; a standalone `mongod` is insufficient. Docker is optional. This repository contains no built-in passwords or production secrets.

## Set up

```powershell
npm.cmd ci
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Put the generated value in `JWT_ACCESS_SECRET` in `.env`. Set `MONGODB_URI`. For local Docker:

```powershell
docker compose up -d --wait
npm.cmd run seed
```

The local Compose database binds only to loopback and is for development; it does not implement production database authentication.

Create the first owner explicitly by setting `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters in your local environment, then:

```powershell
npm.cmd run setup:admin
```

Remove the administrator password from the environment after setup. This command refuses to create a second owner. No public registration can choose a privileged role.

```powershell
npm.cmd run dev
```

Open http://127.0.0.1:5173. API: http://127.0.0.1:4000/api/v1. Use that exact browser origin (not `localhost`) to match trusted origin and cookie configuration. Vite proxies `/api` and `/Photos`. For separate startup use `dev:client` and `dev:server`.

If MongoDB/Docker is not installed, `npm.cmd run dev:local` starts a local development replica set using the downloaded test binary and serves both frontend and API. Records persist in ignored `.runtime/mongo`; session secrets are ephemeral unless explicitly supplied. It prints the local MongoDB URI to use with the separate administrator setup command. This helper is for development only and may require permission to download/start MongoDB.

## Verify

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd audit --omit=dev
```

API tests use an isolated `mongodb-memory-server` replica set. The first run downloads the MongoDB test binary and may need network access. Tests use only fictional data. Browser E2E instructions and recorded validation are in [testing](docs/testing.md).

## Production

Build, set `NODE_ENV=production`, configure a trusted HTTPS `CLIENT_URL`, a restricted TLS MongoDB replica set, a long unique JWT secret and optional verified business contacts. Run `npm.cmd start` behind a TLS reverse proxy. Express serves `dist` and the original `/Photos/Logo.png`; do not host `Documents/` or the entire workspace. See [deployment](docs/deployment.md).

## Core workflow

1. Browse public services and submit a limited inquiry or create a client account.
2. Submit a care request from Request care; the portal shows its real status.
3. Owner/operations: Bookings → Begin assessment → Prepare quote → Send agreement.
4. Client: Agreements → read and explicitly accept → download the snapshot.
5. Owner/operations: confirm billing and booking.
6. Owner: Team → create caregiver account; Caregivers → onboard profile with that account ID. The caregiver signs their engagement agreement; owner verifies and approves the profile.
7. Owner/operations: schedule a caregiver using the account ID, start/end and approved instructions. Server checks eligibility, agreements, conflicts, rest and hours.
8. Caregiver: Schedule → Start shift → Complete shift. Families view approved schedules and can open support requests.
9. Owner/accountant: Billing → invoice → record a verified offline payment. Owner can record approved refunds. PDFs and CSV are authenticated.

For extended care, schedule suitable multiple-person shifts. The application does not permit one person to be scheduled continuously for 24 hours. Replacement, cancellation, extension and transfer requests require a human review and the appropriate operational change; a support-ticket resolution alone does not change a booking.

## Documentation

- [Architecture and collections](docs/architecture.md)
- [API and authorization](docs/api.md)
- [Security](docs/security.md)
- [Legal research and review](docs/legal-review.md)
- [Deployment and troubleshooting](docs/deployment.md)
- [Asset map](docs/assets.md)
- [Validation](docs/testing.md)

Optional Resend credentials enable generic portal update emails. Without them, notifications remain in-app. Password recovery cannot send a recovery link without an email provider; it does not expose reset tokens in logs or API responses. SMS, WhatsApp, online payments and private uploads are not implemented and must not be advertised as available.
