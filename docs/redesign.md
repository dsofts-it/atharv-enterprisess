# Visual redesign handover

The later [scroll, artwork and typography update](scroll-and-theme.md) supersedes the original palette, typography and one-time entrance behavior described below. It adds a navy/ivory editorial theme, locally served Manrope/DM Sans, repeated entrances, scroll-linked movement and 18 distinct new SVG illustrations.

The redesign preserves the React/Vite app, existing routes, MongoDB records, auth cookies, permissions, care request lifecycle, attendance and billing operations. Source stays inside `atharv-care`; the supplied logo remains in sibling `Photos/Logo.png`. No real records were added or changed for visual demonstrations.

## Interface

- Home: editorial hero, optimized local care photograph, distinct illustrated service gallery, five-stage journey, care matching checklist, family feedback invitation, portal introduction, Pune coverage, searchable/categorized animated FAQ, illustrated CTA and footer.
- Navigation: sticky scroll treatment, button-operated services dropdown, Escape/outside close and mobile drawer. Critical links do not depend on hovering.
- Portal entry: complete split sign-in experience, original family visual, registration, recovery, password visibility, busy/error/success states and privacy explanation. Authentication still uses real backend endpoints; no mock login or built-in password.
- Dashboards: role-specific illustrated welcome, database-backed metric cards, request timeline, upcoming shift and authorized caregiver summary, month/date calendar, billing summary and updates. Owner/operations, client, caregiver and finance views query only their permitted resources.
- Operational pages: search and status filters, differentiated illustrated empty states, accessible native-dialog forms with initial focus, focus containment, Escape and close controls.
- About, contact and service-detail pages: additional original illustrations.

## Design and motion

`client/src/redesign.css` contains reusable color, layout, timing and easing tokens. Deep navy, cyan, pale blue, soft sage and small magenta accents reference the original logo. CSS component breakpoints cover mobile, tablet and wide desktop; the six required sizes are exercised in browser tests.

Motion for React handles line reveals, section entrances, staggered cards, image reveal, accordions, dropdowns and dialogs. CSS handles press/hover feedback, route entrances, brief decorative floating and loading skeletons. No additional animation dependency was introduced. Reduced motion immediately shows content and disables nonessential movement, including offscreen reveal states.

The original base stylesheet remains to protect existing form and operational layouts; the redesign layer overrides presentation. A future styling cleanup can consolidate unused legacy rules after broader product acceptance.

## Asset manifest

21 original code-native SVG scenes live in `public/images/illustrations/`, with a machine-readable `manifest.json`. They cover six distinct services, family care, booking, verification, scheduling, coordination, trust, client and caregiver welcomes, booking/notification/invoice empty states, contact, team, FAQs and the care journey. `scripts/create-illustrations.mjs` recreates this original vector library.

| Asset                                                | Intended use                                    | Provenance                                                                             |
| ---------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| `public/images/hero/home-care.webp`                  | Home hero                                       | Optimized derivative of the previously generated illustrative care image; about 140 KB |
| `public/images/dashboard/family-care-portal.webp`    | Portal welcome                                  | New built-in imagegen visual, optimized WebP; about 127 KB                             |
| `public/images/illustrations/family-care-portal.png` | Retained source                                 | Original generated source; fictional subjects                                          |
| `public/images/illustrations/*.svg`                  | Services, process, support pages and dashboards | Original project-native vector compositions; fictional subjects                        |
| `../Photos/Logo.png`                                 | Branding and PDFs                               | Original supplied logo, unchanged                                                      |

The two WebP files were encoded locally without changing the image content. Original source files are retained. Images are served locally, have descriptive names, dimensions and appropriate alt text, and below-fold scenes lazy-load. Decorative repeated art has empty alt text. No illustrative person is presented as a real staff member or client.

Final prompt for the new image (built-in imagegen mode):

> Use case: illustration-story. Asset type: premium home healthcare portal illustration. Create a polished editorial flat vector-style illustration of an Indian adult daughter and elderly father sitting on a pale blue sofa talking with an Indian female care coordinator in navy scrubs holding a tablet, a tasteful apartment setting with a large window and broad leaf plant. Full composition isolated on very pale icy blue background, square 1:1, generous breathing room, adults with natural realistic proportions, sophisticated simplified faces, no childish cartoon. Color palette deep navy #132c4a, cyan #00b5d1, pale sky #eaf6fc, muted sage, warm terracotta skin colors, one very small magenta accent. Elegant minimal geometric shapes, subtle soft gradients and restrained grain, refined editorial healthcare startup illustration. Not photorealistic. No text, no numbers, no logos, no watermark, no medical procedures. Fictional illustrative family and staff.

## Truthful content

No invented testimonials, response-time promises, staff counts or credentials are displayed. `Testimonials` supports genuine, authorized entries; until supplied, the public page offers a feedback invitation instead. Extended/longer-term care remains subject to the existing assessment and staffing process. No new clinical service is implied by an illustration.

## Verification

Final checks: 19 unit/integration tests and 10 browser tests passed. Frontend/backend type checking, ESLint and the production build passed. The final client-column and dialog-focus refinements were additionally checked with the affected browser tests. Responsive checks cover 360, 390, 768, 1024, 1440 and 1920 pixels; public routes also verify all image assets decode successfully.

Browser tests run on isolated ports 5174/4101 with temporary MongoDB and randomized, test-only role credentials in ignored `.runtime`. The normal development app continues on 5173/4000. Fictional invoices and people exist only in the test database. Screenshots are in ignored `test-results`.

The new caregiver profile endpoint returns only the signed-in caregiver’s approved profile fields. Assignment summaries expose only the already-authorized booking’s preferred name, locality and service, not patient contact details or unrestricted health records. Existing ownership and assignment filters remain authoritative.

Persistent previews are saved in `docs/previews/` for home and portal at desktop/mobile sizes. Dashboard preview filenames explicitly identify their fictional browser-test data. Restart the normal development server to load the backend additions; `npm.cmd run dev:local` and the original 5173/4000 addresses are unchanged.

Provider credentials, production clinical/legal review and advanced modules listed in `implementation.md` remain separate from this visual redesign. Password recovery delivery still requires the configured email provider. Automated browser coverage is not a full screen-reader audit or WCAG certification.
