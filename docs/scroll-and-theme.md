# Scroll motion and professional theme

The site now uses Manrope Variable for headings and DM Sans Variable for interface/body text, bundled locally through Fontsource. The current design uses white and soft mint surfaces, deep teal headings and primary controls, and dark supporting text. The hero uses a simple rounded photo frame with one readable care note. Main body text is 16–18px, section headings are 30–42px, and compact labels are at least 14px. Earlier tiny-label overrides have been corrected. The supplied logo and business workflows are unchanged.

## Motion behavior

`Visual.tsx` connects component positions to their own viewport scroll progress using Motion values and springs. Visible components continue a small vertical drift as the page scrolls. Art has a separate restrained translation, rotation and scale response. These values update without React re-rendering on every scroll event.

Entrance animations now use `once: false`; sections fade/slide or scale into view again when revisited. Headings and large illustrations use different entrance treatments. The hero composition also has scroll-linked parallax, and a slim reading progress indicator follows page progress. No scroll locking or scroll hijacking is used.

`prefers-reduced-motion` disables translations, rotations, scaling, re-entry fades and smooth scrolling. Content stays fully visible and immediately available. The progress bar updates directly rather than using a spring.

## Distinct artwork

18 new original SVG compositions live under `public/images/editorial/`. Each homepage illustration slot uses a distinct asset. Services have separate clinical observation, mobility support, wheelchair assistance, recovery, coverage-clock and bedside scenes. The care journey uses a notebook, team handover, quote review, connected care and continuity path. Screening, family feedback, the portal preview, questions and closing conversation each have different compositions.

The images are project-native vector artwork, not photographs of real employees or clients. Original older assets are retained for other authorized application contexts. `scripts/create-editorial-art.mjs` recreates the new library; `public/images/editorial/manifest.json` maps its intended uses.

## Font licensing and delivery

Both font packages include the SIL Open Font License. Copies are retained in `docs/licenses/`. Fonts are served by the app, so rendering does not depend on a Google Fonts request. Package lock pins installed versions. Implementation follows [Fontsource installation guidance](https://fontsource.org/docs/getting-started/install).

## Verification

Current theme verification: all 14 browser checks pass, along with TypeScript, ESLint and the production build. The prior 19 unit/integration checks passed during the scroll implementation; this visual update does not change backend logic. The browser checks include 360, 390, 768, 1024, 1440 and 1920 pixel layouts. Installation reported zero known dependency vulnerabilities. Desktop/mobile previews are refreshed in `docs/previews/`.

Dedicated browser tests check that a visible card’s transform changes as the page scrolls, that leaving and revisiting increments its reveal count, and that reduced-motion mode keeps transforms disabled. They also verify unique homepage illustration sources, decoded images and locally served WOFF2 files. The existing care-request/authentication, dashboard and six-width responsive regression suite remains in place.
