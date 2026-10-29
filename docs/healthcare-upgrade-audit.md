# Healthcare upgrade audit and feature gap report

Audit date: 29 October 2026. Scope: the existing local Atharv Care repository; no production account, live patient record, DNS setting or deployed service was changed.

## Architecture and existing behavior

The application is a shared-package React/Vite frontend (`client`), Express/TypeScript backend (`server`) and MongoDB/Mongoose database. Shared validation and catalog definitions are in `shared`. Build scripts and dependencies are at the repository root. Authentication, scoped client/caregiver access, care assessment/quote/agreement workflows, shift scheduling, billing/PDFs and audit records already existed and were preserved.

The source audit covered routing, public pages and navigation, form validation, public enquiry endpoints, authentication/session configuration, models, admin operations, transactional assignment checks, content rendering, image paths, deployment configuration and the existing automated tests. This is an engineering review, not a penetration test, clinical assessment, statutory compliance certification or live account audit.

The original catalog contains six services. Public enquiries were stored, but had fewer fields, only new/reviewed/closed statuses, and no enquiry analytics, assignment or follow-up notes. The owner could edit limited service fields but could not create service drafts or manage translated content. The old site used custom illustrations and had no language selector or public photography gallery.

## Reference verification

The exact requested URL, https://www.wecarehomenursing.in/, timed out when accessed. Search results returned similarly named businesses on other domains; these were not treated as the supplied reference. Therefore no feature is claimed to have been verified on the reference. Visual and functional changes follow the supplied written brief and are original. Reference comparison remains pending access to that exact site or supplied screenshots.

## Prioritized feature gap analysis

| Feature | Available in current website before upgrade | Visible or verified in reference website | Recommended improvement | Priority | Implementation status |
| --- | --- | --- | --- | --- | --- |
| Responsive public website | Yes, illustration-led | Not verified | Navy/teal healthcare design, clear enquiry path | P0 | Implemented |
| Three client languages | No | Not verified | English, Hindi and Marathi with persistent selector | P0 | Public pages, policy drafts, sign-in/request workflow and main client dashboard/navigation localized; internal authoring tools remain English |
| Realistic service photography | Illustration assets | Not verified | Distinct optimized Indian-home photographs | P0 | 16 AI-generated photographs integrated; originals retained locally |
| Service search/filtering | Service listing/details existed | Not verified | Search and clinical/everyday filters | P0 | Implemented |
| Detailed services | Six routes existed | Not verified | Photos, audience, scope, scheduling and preselected enquiry | P0 | Implemented; custom services support stored translations |
| Public enquiry | Compact working form/API | Not verified | Expanded preferences, optional email, Indian mobile validation | P0 | Implemented with persistence, reference, consent, honeypot, rate limiting and retry deduplication |
| Admin enquiry management | List/mark reviewed | Not verified | Search, statuses, assignment, notes, analytics, summary export | P0 | Implemented; protected and audited |
| Service publishing | Limited edits | Not verified | Add drafts, enable/disable, sort, feature, images, translations and SEO | P1 | Implemented; nine suggested categories prepared in editor; none automatically advertised |
| Content management | No general content editor | Not verified | Approved multilingual banners/about/FAQ/reviews/gallery/video/blog/contact | P1 | Implemented with unpublished drafts and public rendering |
| Marketing image uploads | No | Not verified | Rights confirmation, image-only uploads, persistent storage | P1 | Implemented; owner-only, size/signature checks, translated alt text, MongoDB storage |
| Enquiry analytics | New-enquiry count | Not verified | Counts, statuses, popular services, monthly trends | P1 | Implemented from database records; no fabricated metrics |
| Public gallery | No dedicated gallery | Not verified | Filters, lazy loading, modal, keyboard close | P1 | Implemented; illustration labels distinguish generated photos |
| Testimonials | No verified review material supplied | Not verified | Publish only real approved reviews | P1 | Editor/rendering implemented; no fake reviews seeded |
| Educational resources | No dedicated structure | Not verified | Family-planning guides and reviewed blog publishing | P1 | Implemented; default guides concern service planning, not treatment advice |
| Contact/WhatsApp/map | Configured contacts partially supported | Not verified | Quick-contact panel and owner-editable verified details | P1 | Implemented; links hidden until actual details supplied |
| SEO | Runtime titles and backend sitemap | Not verified | Localized metadata, structured data, frontend sitemap/robots | P1 | Implemented; dynamic services need frontend sitemap rebuild; server-rendered per-route previews remain a future improvement |
| Privacy requests | Existing support-ticket workflow | Not verified | Reviewed enquiry redaction | P1 | Owner-only redaction for closed/cancelled enquiries; no automatic destruction of financial/audit records |
| Access control/CSRF | Auth/RBAC; broad CORS requested earlier | Not verified | Keep role checks; configurable production origin restrictions | P0 | Optional exact-origin mode added; default all-domain mode preserved as previously requested; configure before handling real patient data |
| Production assurance | Existing local tests | Not verified | Regression tests, responsive checks, deployment smoke tests | P0 | Local checks recorded below and in testing documentation; live deployment checks still required |

## Actual service availability

The existing six catalog services remain the starting offering. Suggested categories in the owner editor include tracheostomy care, neurological/paralysis support, orthopedic support, physiotherapy, baby care, mother/newborn support, palliative support, medical equipment assistance and child care. They are templates for unpublished drafts, not assertions of staff availability. The owner must provide accurate scope and translations, verify capability and explicitly publish. Each published service needs a distinct photograph. Physiotherapist qualification is supported separately from nurse and attendant qualifications; clinical assignment checks preserve credential expiry and role matching.

## Security and privacy findings

- React renders text without raw HTML insertion. Shared strict Zod validation protects public submissions. Consent, mobile format, date preferences and service availability are checked; unknown fields and honeypot submissions are rejected.
- Enquiry references and UUID retry keys have unique indexes. Concurrent retries recover the existing reference. Public responses do not return enquiry records. Notifications contain generic portal prompts rather than health/contact details.
- Owner/operations enquiry access and owner-only service/content/media/settings controls remain authenticated. Follow-up changes and exports are audited. CSV exports exclude contact numbers, email, health requirements and internal notes.
- Marketing uploads are limited to 1.5 MB, PNG/JPEG/WebP signatures, translated alt text and a rights acknowledgement. SVG/HTML are rejected. They are public marketing assets, never a private patient-document upload feature. Metadata stripping, full image re-encoding and malware scanning are not implemented and remain hardening work.
- CORS defaults to the all-domain mode previously requested. With credentialed sessions, that trusts every requesting website; it is not CSRF protection. Set `CORS_ALLOWED_ORIGINS` to exact trusted frontend origins for real records. Restricted mode also rejects untrusted mutation origins. Public form rate limiting remains active in either mode.
- Existing HttpOnly sessions, secure production cookies, Argon2 passwords, scoped records, transaction controls and protected PDFs were retained. Third-party-cookie restrictions still apply between unrelated Pages/Render domains; use sibling HTTPS custom domains for production login.
- The owner can redact personal details and notes from closed/cancelled enquiries after documented retention review. Backups, billing and audit retention need business/legal policy; no automatic expiry or deletion policy was invented.
- Verified address/contact details, grievance contact, consent wording, retention periods, backup policy and operational security review remain business responsibilities. Policy pages remain explicitly marked as drafts in all languages.

## Language scope

English, Hindi and Marathi copy is authored in the repository, not obtained through a remote translation widget. The selection persists locally and updates document language. Public discovery, service descriptions, FAQs, enquiry validation/confirmation, guidance, policy information and main client controls are localized. Admin content and service editors store all three languages. Staff tools and some operational strings remain English. User-written records, issued invoices and signed agreement snapshots retain their original language; clients are prompted to obtain clarification before accepting agreements. Native-language professional review of published care/legal terminology is still recommended.

## Performance and QA limits

All 16 WebP photographs total approximately 1.2 MB; hero delivery is 1200 px wide and service delivery 900 px wide, with lazy loading outside the hero. Public healthcare routes and the portal are split into separate chunks. The initial application chunk still triggers Vite's 700 kB warning, so further legacy-route splitting is a documented optimization item. No Lighthouse or real-user Core Web Vitals score is claimed. Automated Chromium/Edge checks use multiple viewport widths; they do not replace native Safari/iOS, Android-device, assistive-technology or slow-network production testing.

No SMS provider, payment gateway, CRM, real review content, verified staff biography, address, credentials or price was fabricated. Email needs the existing configured provider; SMS/CRM/online payment remain optional integrations rather than nonfunctional buttons.

## Final verification

31 unit/integration tests and all 21 browser tests passed. TypeScript, lint and the production build passed; production dependency audit reports zero known vulnerabilities after the compatible body-parser update. See [test results and limits](healthcare-testing.md).
