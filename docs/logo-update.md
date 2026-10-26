# Transparent website logo

Source: `public/images/Logo.png`, the newer symbol-only logo supplied by the user. Inspection found opaque black pixels in the background; `public/Photos/Logo.png` was also the older opaque version. Both supplied files remain unchanged.

Output: `public/images/brand/logo-transparent.png`, made with the built-in imagegen tool in background-extraction mode. The output is a real RGBA PNG with a fully transparent corner (alpha 0), not a CSS blend effect. The shared Logo component and favicon use this asset directly from the frontend, avoiding the legacy `/Photos` development proxy. The mark displays at 68px desktop, 60px tablet, 50px mobile, 56px portal sidebar and 76px footer. CSS removes the old black background and rounded tile and keeps the mark centered beside the business name.

Final prompt:

> Edit target: supplied Atharv Enterprises medical logo. Background extraction only. Remove ALL black and near-black background, including between wings, staff and snake loops, to genuine fully transparent alpha. Preserve exact existing cyan top arc, magenta lower arc, silver-white medical winged staff and snakes, shapes and proportions. No redesign, no new shapes or text. Source already has no lettering; discard empty bottom third padding and tightly frame the original medical symbol with small transparent margin around the colored arcs. Produce a clean transparent PNG cutout for a website header. Save the result locally and return its file path.

Verification: production build and TypeScript passed. Two existing browser tests passed, covering mobile navigation plus homepage/portal containment and decoded images at 360, 390, 768, 1024, 1440 and 1920px. Additional browser inspection confirmed the logo's loaded source, transparent CSS background and alpha-0 PNG corner. Desktop/mobile previews are in `docs/previews/transparent-logo-1440.png` and `transparent-logo-390.png`.
