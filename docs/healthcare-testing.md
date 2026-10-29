# Healthcare upgrade verification — 29 October 2026

## Completed local checks

- TypeScript: frontend and backend pass (`npm run typecheck`, also part of the production build).
- ESLint: pass (`npm run lint`).
- Unit/integration suite: **31 tests pass across four files** (`npm test`). Existing auth, role scoping, transaction, schedule, agreement and billing tests remain, with new enquiry/content/service/privacy and non-JSON hosting-error coverage.
- Browser suite: **21 tests pass** (`npx playwright test`). Browser: installed Microsoft Edge/Chromium, isolated MongoDB replica set and fictional accounts/records.
- Production build: frontend assets, backend compilation and frontend sitemap/robots generation pass (`npm run build`). Vite reports an initial JavaScript bundle over its 700 kB warning threshold; no Lighthouse score is claimed.
- Production dependency audit: **zero known vulnerabilities** (`npm audit --omit=dev`). A reported body-parser advisory was addressed by updating the compatible transitive dependency from 2.3.0 to 2.4.0; no new direct package dependency was added.
- Image delivery: 16 distinct optimized WebP photographs, approximately 1.2 MB total. High-resolution PNG masters remain in the ignored local output folder.

## Browser coverage

- Public homepage and service-detail navigation.
- Progressive sign-in, account creation, private care request and preserved preferences.
- New visitor care guide and uncertain-visitor contact path.
- English/Hindi/Marathi switching, document language and reload persistence.
- Marathi enquiry submission, ENQ reference, owner enquiry search, status update and follow-up note persistence.
- Owner service editor saving, marketing photo upload, three-language FAQ publication and public rendering.
- Public gallery filtering, modal keyboard/Escape handling.
- Ten public routes at 360, 390, 768, 1024, 1440 and 1920 px, plus service cards at 320 px.
- Desktop/mobile image decoding, no horizontal overflow, local fonts, visible content, contrast checks and reduced motion.
- Preserved client, caregiver, owner and accountant dashboards, scoped API requests, billing navigation and quote dialog keyboard focus.
- Service menu keyboard close and FAQ search, including empty search results.

The general and authentication test-mode limits are raised to accommodate hundreds of automated requests from the same local IP. Production limits remain 180 API requests/minute and 40 auth requests/15 minutes; public enquiry limits remain 10/hour. This fixture difference is not a production rate-limit removal.

## Backend verification highlights

Enquiries persist without an email address, retry keys do not create duplicate records, owner notifications are generic, invalid mobile numbers and honeypot submissions are rejected, unavailable services cannot be enquired about, client accounts cannot access admin enquiries, owner status/assignment/notes and summary exports work, content drafts stay private, image signatures are checked, published content exposes image metadata without file buffers, services start unpublished, published photos must be unique, and enquiry redaction requires an owner retention review after closure/cancellation.

## Visual review artifacts

Local artifacts are ignored by Git and are not deployed:

- `output/qa/healthcare-desktop.png`
- `output/qa/healthcare-marathi-mobile.png`
- `output/qa/healthcare-marathi-mobile-top.png`
- `output/qa/healthcare-photo-contact-sheet.jpg`
- `output/imagegen/healthcare/*.png` (high-resolution sources)

The desktop and Marathi mobile previews and photograph contact sheet were visually inspected. Photos are illustrative and visibly labelled; no genuine patient/staff evidence or reviews were invented.

## Not verified or pending external action

- No live Cloudflare/Render deployment, DNS update or production-data migration was performed.
- The exact reference site timed out, so reference-specific feature claims remain unverified.
- Native iPhone/Safari and Android hardware, screen-reader review, live slow-network behavior, production email delivery, real-user Core Web Vitals and Lighthouse were not tested.
- Business owner approval of actual service capability, phone, WhatsApp, address, prices, staff credentials, genuine testimonials and all operational/legal wording is still needed before publication.
- Internal admin authoring controls retain English labels. User-entered data and issued/signed documents remain in their original language rather than being silently translated.
- Restrict CORS origins before real patient records are handled. Default all-domain mode remains as previously requested. Cookie behavior on unrelated preview domains must be checked in the target browser.
- Marketing image metadata stripping, malware scanning, shared rate-limit storage, privileged MFA and automatic retention cleanup remain hardening items. Policy content is a translated draft, not a legal compliance certification.

See `healthcare-upgrade-audit.md` for the feature gap matrix and `cloudflare-render-healthcare.md` for publishing and owner setup.
