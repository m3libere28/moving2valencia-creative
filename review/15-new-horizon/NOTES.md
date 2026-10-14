# A New Horizon — design notes

Concept 1 of the Moving2Valencia redesign series. A single-page story that moves from curiosity to action. One graphic motif carries the whole page: the Mediterranean horizon becomes a route through the city, then a doorway, then the underline beneath the closing invitation.

- **Preview:** the published artifact "A New Horizon" (private until shared).
- **Source:** `a-new-horizon.html` in this Project (identical to the published page). The published version also serves 23 WebP images from `img/`.

## Version 2 changes (13 Oct 2026)

1. **Hero:** the drawn sea is replaced by the real Malvarrosa photo, full-bleed. The drawn horizon line and IMAGINE are aligned in script with the photo's own horizon (84.2% of image height) at every viewport size. The photo eases from 1.12× to 1× as the "horizon opens".
2. **Word art:** IMAGINE and BELONG are now solid letters. The photography lives inside the arch doorways instead, because Bodoni's hairlines were too thin to hold an image.
3. **Rhythm:** "Your route to arrival" is now deep Mediterranean blue. A full-bleed panorama (the rooftops from the Micalet) sits between the trust and belong chapters.
4. **Type:** the serif is reserved for large display sizes (about 32px and up). Every h3, caption, FAQ question, approach label and phone tab uses Instrument Sans.
5. **BELONG doorway:** the letters fade out before the scene appears at full strength inside the arch. This also fixes a bug where the browser shortened the clip-path value and the arch opened lopsided.
6. **Nav:** cut to four links (Life here, How it works, Christa, Questions). Motion is now a 44px icon button labelled "Scroll animation".
7. **Christa's portrait** (supplied by Helbert) fills the arched frame in chapter 5.

## Creative system

| | |
|---|---|
| Display type | Bodoni Moda (opsz 6–96, roman 400–700 + italic) |
| Text type | Instrument Sans 400/500/600 |
| Palette | limestone `#EEE6D8`, paper `#F7F2E9`, deep sea `#0F3B5C`, sea `#1D5C84`, citrus `#E88A2E` (accent only), terracotta `#A2462A` (labels), ink `#14191F` |
| Rhythm | **photo** hero → limestone → **ink** (questions) → **deep sea** (route) → limestone (Christa) → **photo** interlude → paper → limestone → paper → **sea** footer |
| Word art | IMAGINE (solid paper on the horizon), ARRIVE (outline + offset citrus ghost + fill revealed bottom-up), BELONG (solid ink). Photos sit inside the arch doorways. All decorative copies are `aria-hidden`; real headings carry the meaning. |

## Chapter storyboard

1. **Horizon (curiosity).** Animated sea (canvas glints, clearly illustrative), "Imagine your life in Valencia.", the proposition and both CTAs in the first viewport.
2. **A life within reach (desire).** Four photographs: Mercado Central, an El Carmen square, the Turia gardens and Plaza de la Virgen. They sit on an asymmetric grid and are joined by a drawn citrus route.
3. **Where do we begin? (uncertainty → reassurance).** Four questions sit scattered, then align into a numbered plan: Plan, Prepare, Arrive, Settle.
4. **Your route to arrival (clarity).** A sticky route map with milestones, four stages mapped to the six existing services, expandable details, and "What the first call covers".
5. **A person beside you (trust).** An arched portrait frame, still empty, and Christa's approach. Unverified biography lines are marked †.
6. **Somewhere to belong (payoff).** A keyboard-accessible atlas (City rhythm / Outdoor life / Family routines), then signature scene 3.
7. **Your first step (action).** FAQ, then "Your Valencia story starts with a conversation." with the horizon returning as an underline, an honest email-draft form, and a footer with photo credits.

## Motion map

One coordinator: `gsap.matchMedia()` with desktop (≥900px) and phone branches. It is rebuilt when the motion toggle changes and refreshed after fonts and images load. Only the three signature scenes pin, and only on desktop.

| Scene | Purpose | Trigger / length | Phases | Reading pause | Exit | Phone | Reduced motion |
|---|---|---|---|---|---|---|---|
| **1 · Horizon → IMAGINE → doorway** | Turn a view into an invitation | Hero top at viewport top; pinned for 130% of viewport height | 0–30%: horizon line widens, sun rises · 30–60%: copy lifts away, IMAGINE grows from 0.32× and fills with the beach photo · 60–70%: hold · 70–100%: stage clips to an arch, IMAGINE settles inside, "Step through" appears | 60–70% | The arch reveals the limestone of chapter 2 | No pin; the same timeline scrubs across the hero's height | Static: IMAGINE at half scale on the horizon, no clip |
| **2 · Questions → plan** | Uncertainty becomes steps | Stage top at viewport top; pinned for 120% | 0–15%: scattered questions hold · 15–55%: they slide and rotate into place · 52–75%: labels, answers, rules and the spine appear · 80–100%: hold | 80–100% | Unpins onto chapter 4 | No pin; each row slides in over a short scrub | Static aligned list |
| **3 · Collage → BELONG → doorway → scene** | Arrival as belonging, tied back to the horizon | Stage top at viewport top; pinned for 150% | 0–20%: collage drifts · 20–50%: tiles gather to the centre, BELONG grows and fills with rooftops · 50–60%: hold · 60–88%: a citrus arch appears, the night scene opens from the arch to full bleed · 86–100%: closing line, hold | 50–60% and 90–100% | Unpins onto the FAQ | No pin; tiles settle, BELONG fills, the scene opens from arch to full as it enters | Static stack: collage grid, BELONG, then the scene |

Smaller cues: the chapter 2 route draws with scroll, images drift a few percent, a one-time right-to-left reveal on the first image, captions stagger in, ARRIVE fills bottom-up, the route map milestones light up, the portrait reveals, and the closing underline and footer horizon draw. The entrance on load is the H1 line reveal and the aside fading in, under 1.2 s total. There is no loader.

Controls and behaviour:
- The **Motion** button in the nav toggles motion. It remembers the choice (`localStorage`, wrapped in try/catch) and honours `prefers-reduced-motion` by default.
- The sea canvas pauses when off-screen, when the tab is hidden, or when motion is off.
- Native scrolling, anchors and history are untouched. There is no scroll-jacking, scroll snapping, cursor replacement or audio.

## Asset manifest and rights

All photographs are real, from Wikimedia Commons, and used under Creative Commons licences. Each one is resized and cropped to WebP at two widths, and credited in the page footer with links to the source and licence. **CC BY-SA images:** the edited versions carry the same licence.

| File | Use | Source | Author | Licence | Mobile |
|---|---|---|---|---|---|
| malvarrosa-sky | Hero, full-bleed | [Playa de la Malvarrosa (Valencia) 01](https://commons.wikimedia.org/w/index.php?curid=1602688) | Manuel Martín Vicente | CC BY 2.0 | 800w |
| mercado-central | Ch.2 scene 1 (4:5 crop) | [Mercado Central … DD 115](https://commons.wikimedia.org/w/index.php?curid=34930578) | Diego Delso | CC BY-SA 3.0 | 800w |
| el-carmen-square | Ch.2 scene 2 (3:4), collage | [Jardines … barrio del Carmen](https://commons.wikimedia.org/w/index.php?curid=117427534) | 19Tarrestnom65 | CC BY-SA 4.0 | 800w |
| turia-gardens | Ch.2 scene 3 (1:1), collage | [Jardines del Turia 2006](https://commons.wikimedia.org/w/index.php?curid=845688) | Adelheid Bischoff | CC BY-SA 3.0 | 800w |
| plaza-virgen | Ch.2 scene 4 (16:11) | [Plaza de la Virgen - Valencia](https://commons.wikimedia.org/w/index.php?curid=123160427) | Jorge Saturno | CC BY-SA 4.0 | 800w |
| falla-night | Atlas: City rhythm | [Falla valencia 2006-03-19](https://commons.wikimedia.org/w/index.php?curid=646367) | Rafa Castillo | CC BY-SA 3.0 | 800w |
| arts-sciences-day | Atlas: Outdoor life | [La Ciudad de las Artes y las Ciencias](https://commons.wikimedia.org/w/index.php?curid=7617005) | Emilio García | CC BY-SA 2.0 | 800w |
| paella | Atlas: Family routines, collage | [Paella … socarrat](https://commons.wikimedia.org/w/index.php?curid=170418642) | Juan Emilio Prades Bel | CC BY 4.0 | 800w |
| rooftops-panorama | Full-bleed interlude | [Valencia desde el Micalet](https://commons.wikimedia.org/w/index.php?curid=9801954) | jmerelo | CC BY-SA 2.0 | 800w |
| hemisferic-night | Closing full-bleed scene | [El Hemisférico … DD 71](https://commons.wikimedia.org/w/index.php?curid=34921514) | Diego Delso | CC BY-SA 3.0 | 800w, 4:5 crop |
| market-hall, turia-fountain, mercado-facade | Collage tiles | Diego Delso (×2), FriedrichFrisch | — | CC BY-SA 3.0 / 4.0 / 4.0 | 800w only |

- **Not used:** the Canva deck "Valencia Photo Sourcing". Its images appear AI-generated (one sign reads "Carre de Baix"), and the client asked for no generated imagery.
- **Christa portrait** (`christa-600/1000.webp`): supplied by Helbert as a photo of Christa. Confirm the photographer's credit and Christa's permission before launch.
- **No illustrative imagery remains.** The canvas sea was removed in v2.

## Content status

**Confirmed or general:** service names come from the current site. Valencia context (Las Fallas in March, Valencian as co-official, the Turia gardens, Malvarrosa, the Albufera, school types) is general public knowledge.

**Draft, marked † on the page:**
- Christa's surname: memory says **Brokke**, the old prototype says **van der Meer**. The page uses "Christa" only.
- Running the business herself, moving with her family, and a stage-production background.
- The free call.
- The email address `info@moving2valencia.eu`.
- All FAQ answers and the service wording.

**Removed until sourced:** prices, testimonials, "500+ families", "16 years", the Forbes/InterNations/Numbeo rankings, and the placeholder WhatsApp number.

**Contact flow:** the form prepares an email draft. It offers "Copy email text" and an "Open in email app" convenience link, and states that nothing is sent from the page. There is no success state and no fake endpoint.

## Verification report (re-run in full on v2 with the same results) (headless Chromium 1.56 via Playwright, local server; GSAP 3.12.5 served from npm; Google Fonts served from a local cache)

| Check | Result |
|---|---|
| Widths 320 / 390 / 768 / 1440 | No horizontal overflow at any of 24 scroll positions per width. Fonts loaded. No console or page errors. |
| Pins | 3 at 1440; 0 at 320, 390 and 768 |
| Slow / fast / reverse scroll | Hero state (IMAGINE opacity / copy opacity) matched going forward and in reverse at all widths (1/0). The copy returns to fully visible at the top. Fast jumps from bottom to top: no errors. |
| Layout shift on load | CLS 0.0001 to 0.0007 |
| Anchors | `#route`, `#belong` and `#contact` land with the section top at 84px on first load, and the nav link likewise. Browser Back restores the empty hash at the top. |
| Resize 1440 → 390 → 1440, reload | Pins rebuild (3 → 0 → 3). No overflow, no errors. |
| Keyboard | Skip link first, then nav, Motion, CTA and hero CTAs. Focus is visible. Atlas tabs: arrow keys and Home/End move selection, focus and panel together. The mobile menu opens, Escape closes it and returns focus. |
| Touch targets at 390 | Nothing under 40px (the wordmark was raised to 44px after the first pass) |
| Reduced motion | `motion-off`, 0 pins, static layouts. The toggle switches to 3 pins and back to 0, and stores the choice. |
| GSAP blocked + all images blocked | Every essential text stays readable (opacity 1) with no script errors |
| Contact | An empty submit names the missing field. A bad email gets a format hint. A valid submit shows the draft panel, focuses its heading and builds the mailto link. Copy falls back to selecting the text when clipboard access is refused. No "sent" claim anywhere. Edit keeps the entered values. |

**Fixed after the first pass:**
- Initial hash navigation was blocked by smooth scrolling.
- The wordmark tap target was too small.
- The scattered questions overlapped.
- The closing line sat under the nav when the doorway opened.

**Limits:**
- Tested in headless Chromium only. Not tested in Safari, Firefox or on real touch devices.
- No screen-reader pass.
- No performance scores were measured.
- The live artifact frame wasn't driven by the test; it ran on a local copy wrapped in the same skeleton.
- I couldn't open sondaven.com from this session, so the reference was taken from the brief's description.
