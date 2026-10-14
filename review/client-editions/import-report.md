# Imported client archive editions

Three editions are included: A New Horizon II, Azahar and A New Horizon. The standalone Valencia Arrivals splash was excluded following the user's steering. The existing twelve concepts and all supplied source folders were not edited by this importer.

Each edition contains `index.html`, `single-file.html` and `website.zip`. The ZIP uses local copies of preview/QA helpers and a local archive notes page. The standalone embeds responsive images, fonts and runtime-loaded scripts; its resource map resolves JavaScript-created image paths and the New Horizon II dynamic script loader. All download files are below 25 MiB. The embedded New Horizon II opening sequence is retained.

Applied bounded fixes: metadata moved from malformed exported wrappers into the head; explicit archive titles and noindex policy; Christa Brokke spelling; removed unapproved package prices, quantities, deadline/result claims, popularity proof and testimonial text; changed requests to editable drafts instead of automatic mail application redirects. Supplied photo credits remain. No 9.5 score, award or performance result is claimed.

Source verification passed for the three main pages: one HTML/head/body/main/h1, no duplicate IDs, no missing static local references or fragments, no autoplay media or audio elements, and no frame-escape navigation. All non-vendor JavaScript and all inline/standalone bootstrap scripts passed Node syntax checking. Website ZIP local references and bundled helper paths resolve.

Remaining review work: parent/root must verify actual browser rendering, touch/keyboard behavior, consultation drafts and the standalone resource-map/dynamic-loader paths. Source checks do not prove cross-browser success, accessibility conformance, performance or a real phone result. Photo rights/portrait consent are inherited from supplied credits and were not independently certified in this import. The initial source loading/reveal timings and immersive animations were retained rather than redesigned.

Rebuild: run `build_client_imports.py` with the bundled Python runtime. It writes only `dist/client-editions/` and reads the supplied `client-review-source/design-review-2026-10-14/sites/` folders. Source SHA-256 values and download byte sizes are in `import-manifest.json`.
