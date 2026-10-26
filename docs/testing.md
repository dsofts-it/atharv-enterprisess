# Verification record

## Light healthcare theme and readability

The light mint/white/deep teal design increases main body text to 16–18px, removes tiny important-label overrides, simplifies hero framing, and enlarges booking actions. `e2e/readability.spec.ts` checks computed font sizes, at least 4.5:1 text contrast for key care content and controls, visible page headings, and horizontal containment at 360/390/768/1024/1440/1920 pixels on the homepage and sign-in page. This is a targeted automated check, not a complete accessibility audit. All 14 browser checks passed across the final regression run and focused rerun, along with TypeScript, ESLint, and the production build. An initial run was disrupted by a development-page reload; the new readability check was also corrected to wait for the lazy-loaded sign-in page before measuring text.


## Scroll, artwork and typography update

19 unit/integration tests and 13 browser tests passed after the scroll/theme update. New browser checks verify movement of an already-visible card during scroll, repeated entrance after leaving and revisiting, a working reading progress indicator, static reduced-motion rendering, distinct homepage illustration URLs, decoded artwork, and locally served Manrope/DM Sans WOFF2 files. The existing authentication, care-request, dashboard, keyboard/dialog and six-width responsive tests also pass. See [scroll-and-theme.md](scroll-and-theme.md) for implementation and font licenses.

## Redesign verification, 22 October 2026

19 unit/integration tests and 10 Playwright tests passed for the redesign. Coverage includes real registration and care-request submission, complete portal entry/recovery, password visibility, FAQ search, dropdown keyboard controls, native-dialog focus, interactive calendar navigation, owner/client/caregiver views, accountant data restrictions and six viewport widths (360/390/768/1024/1440/1920). Local images were decoded and checked for missing assets. ESLint, TypeScript and production build passed. Screenshot and asset details are in [redesign.md](redesign.md). Browser tests now use isolated ports 4101/5174, so normal 4000/5173 development is unaffected. The following initial-build record is retained as history.

Verified on Windows with Node 24.19.0, 22 October 2026.

- TypeScript: frontend and backend pass.
- ESLint: pass.
- Production Vite + backend TypeScript build: pass.
- Vitest: 18 tests pass across frontend validation and isolated MongoDB replica-set integration tests.
- Playwright using installed Microsoft Edge, headless: 3 tests pass. Covers progressive authentication → care request → portal, safe form progress, mobile menu, reduced motion, 390px horizontal overflow, desktop navigation and service FAQ disclosure.
- The `dev:local` launcher started its persistent development replica set successfully; API health returned `database: connected` and the Vite homepage returned HTTP 200. The verification server was stopped after testing.
- npm install audit reported 0 vulnerabilities. A separate `npm audit --omit=dev` request timed out at the registry advisory endpoint and did not produce a result.

The first sandbox test run failed to create MongoDB's user cache. A rerun with process permissions and workspace-local binary cache passed. The first browser run exposed an accessible-label issue, which was corrected by associating explicit labels to form controls. A FAQ test was corrected to open its native disclosure before asserting visibility.

Screenshots are generated under ignored `test-results/`. A generated local image replaces remote image URLs after the first visual check found external delivery unreliable. The final desktop browser test decoded the local image and confirmed nonzero natural width. Updated desktop and mobile screenshots were reviewed; browser tests passed after final source changes.

These checks do not verify every requirement in the master brief. Full manual screen-reader testing, legal review, live provider delivery, actual online payments, production MongoDB, restore drills, load testing and all advanced modules in `implementation.md` remain unverified or unimplemented.

Run `npm.cmd run test:e2e` with ports 4101 and 5174 free. The E2E helper uses temporary test data and ephemeral session secrets; it must not be used as a production server. On non-Windows systems, install an appropriate Playwright Chromium binary; the Windows config uses installed Edge when available.
