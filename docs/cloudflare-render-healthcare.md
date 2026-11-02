# Cloudflare frontend + Render backend — healthcare upgrade

Both services build from the repository root, where package.json lives. No folder move or database reset is required.

## Cloudflare Pages

- Production branch: your deployment branch, currently main.
- Root directory: empty.
- Build command: `npm ci --include=dev && npm run build:client`.
- Output directory: `dist`.
- Build variables: `NODE_VERSION=24.19.0`, `SKIP_DEPENDENCY_INSTALL=true`, `MONGOMS_DISABLE_POSTINSTALL=1`, `VITE_API_ORIGIN=https://atharv-enterprisess.onrender.com`.
- Set `VITE_SITE_ORIGIN=https://atharv-enterprises-8uv.pages.dev` (or your actual canonical custom domain) for sitemap generation.

The new `_headers` file supplies static-site security headers. Vite embeds the API origin at build time. Rebuild after changing it. No database secret or signing secret belongs on Pages.

## Render

- Root directory: empty.
- Build: `npm ci --include=dev && npm run build:server`.
- Start: `npm start`.
- Health: `/api/v1/health`.
- Keep the existing Atlas URI, JWT secret and production settings.
- Set `CLIENT_URL=https://atharv-enterprises-8uv.pages.dev` (exact actual frontend URL, no trailing slash).
- Use `COOKIE_SAME_SITE=none` for unrelated Pages/Render preview domains.
- `CORS_ALLOWED_ORIGINS=*` preserves the previously requested all-domain mode. For production patient records, set `CORS_ALLOWED_ORIGINS=https://YOUR-EXACT-FRONTEND-ORIGIN` or comma-separated exact trusted origins. Restricted mode checks mutation origins as well as CORS headers.
- Production login is more reliable with sibling custom domains (`www.example.com`, `api.example.com`) and `COOKIE_SAME_SITE=strict`.

Existing collections are preserved. New fields are optional for legacy records. New collections and indexes initialize on backend startup. New collection names include contents, media and businesssettings. Images uploaded by the owner persist in MongoDB, not Render's ephemeral filesystem. Monitor storage usage; keep marketing uploads small.

## Owner setup after deployment

Sign in with the existing owner account. If no owner exists, use the existing `setup:admin` workflow; no default password was added.

1. Open **Content → Business contact details and map**. Enter and verify the actual phone, email, WhatsApp, service location, address and optional HTTPS map link. Blank contact fields hide their public links. Environment contact values remain the initial fallback until settings are saved.
2. Open **Services**. Keep unsupported categories unpublished. Use **Prepare draft** to enter actual English/Hindi/Marathi service scope; verify qualifications before publishing. Uploaded or generated service images can be selected. Published services cannot share one photograph.
3. Open **Content** for banners, about information, FAQs, gallery, videos, family guides and real approved testimonials. Drafts stay private; publication requires approval. Bodies render as text, not executable HTML.
4. Open **Inquiries** to search/filter, assign a team member, update status, add internal notes and export summary CSV. Counts and trends come from the database. Notifications reach the in-app portal; external email delivery requires `EMAIL_API_KEY` and `EMAIL_FROM`.
5. Use the privacy/retention controls only after verifying a request and applicable retention requirements. Redaction is limited to closed/cancelled enquiries and does not erase billing, audit records or backups.

## Smoke test after both deployments

- Backend health says database connected.
- Public `/`, `/services`, `/services/home-nursing`, `/find-care`, `/enquire`, `/gallery`, `/faq`, `/resources` and policy routes load and refresh directly.
- Switch English, Hindi and Marathi, reload and confirm language persistence.
- Send a fictional enquiry and retain its ENQ reference. Confirm it appears in owner Inquiries and can be assigned and followed up.
- Verify a real available service is preselected from its card. Disabled/draft services must not appear as available.
- Check navigation, FAQ search, gallery Escape handling, phone and WhatsApp links, contact details and generated-image labels.
- Verify owner content publishing and marketing image upload with a non-sensitive test asset.
- Recheck the preserved private booking, agreement, shift, billing/PDF and support workflows.

The code and generated images are local changes until committed, pushed and deployed. These instructions do not claim a live deployment or alter a hosting account.

## WhatsApp enquiries and owner gallery

Public enquiries at `/enquire`, `/contact` and `/careers` open a prepared message to company WhatsApp **+91 8803602030**. The visitor must press Send in WhatsApp; opening the draft does not prove delivery. These public forms do not create database enquiries. Existing portal records remain available.

The message includes the visitor's name, role, phone, area, requirements/experience, acknowledgement of the displayed company policy, and submission time in Asia/Kolkata. English, Hindi and Marathi are supported. The policy describes company requirements subject to signed agreements and applicable law; it does not claim private engagement is automatically illegal.

Owners sign in at `/login`, open **Content**, and select **Add gallery photo**. Upload a PNG, JPEG or WebP (up to 1.5 MB), provide image descriptions and captions in all three languages, confirm publication rights, approve and publish. Published photos appear first at `/gallery`. Clear publication to hide a photo. Media is stored in MongoDB, so uploads persist across server deploys. Existing owner-only authorization protects publishing and uploads.

If an owner account has not been provisioned, configure `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the server environment and run `npm run setup:admin` against the intended database. Remove the temporary password afterwards. The setup command refuses to create a second owner. Never put these credentials in client environment variables.
