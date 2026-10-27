# Brickyard: Build Plan

This file is both the plan and the progress record. Work top to bottom without stopping between stages. Tick `[x]` as soon as an item is done and verified. Mark `[!]` if blocked (reason in the log). On resume, start at the first `[ ]` or `[!]` item. Behaviour and copy: `docs/REQUIREMENTS.md`. Look: the Claude Design link in `CLAUDE.md`.

Every stage ends the same way: run `npm test`, `npm run typecheck`, `npm run build` (all must pass), then commit, then start the next stage.

---

## Stage 0: Project setup
- [x] Create a Vite + React + TypeScript project in this folder. Keep `CLAUDE.md`, `docs/` and `reference/` untouched.
- [x] Add `three`, `@react-three/fiber`, `@react-three/drei`, Vitest, and Playwright (dev).
- [x] Scripts: `dev`, `build`, `test`, `typecheck`. Update the Commands list in `CLAUDE.md`.
- [x] Create `src/engine/`, `src/ui/`, `src/styles/`.
- [x] `git init` if needed, `.gitignore`, first commit.

## Stage 1: Avatar engine (no UI)
Port the logic from `reference/prototype.html` (REQUIREMENTS section 6).
- [x] `AvatarModel` type and `generateAvatar(seed, options)`.
- [x] Port hash, seeded random number generator, mirror and ensure helpers, the shared 5×5 base pattern.
- [x] The ten styles (4.2), Light background, default hue (Auto).
- [x] Tests: identical output for identical input; every style gives a valid model for sample names, including empty, 40 characters and non-English text.
- [x] Parity test: generate the cell patterns for at least five names in the prototype (run its code in Node or Playwright) and assert the engine matches them for the styles that exist in both.

## Stage 2: Colour and Background in the engine
- [x] Hue override: Auto plus ten hues (4.3). Hue only; saturation and lightness stay in each style's band.
- [x] Backgrounds Light, Dark, Transparent (4.4). Each style has a light and a dark palette (Invader and Aurora need a proper light palette; Quilt shifts tones in Dark).
- [x] Tests: changing hue or background never changes which cells are filled; Transparent returns no background.
- [x] Write `docs/ARCHITECTURE.md` (one page, what was actually built): folder map, the `AvatarModel` shape, how a name becomes cells (hash, random numbers, style, hue, background), how renderers read the model, how to add a style.

## Stage 3: Desktop app (2D)
First read the design files (see CLAUDE.md) and save copies to `reference/design/`.
- [x] CSS variable tokens for light and dark app appearance, taken from the design's Foundations.
- [x] Header: logo, name, tagline, name field (exact label and placeholder), Shuffle, app dark mode toggle (4.9: follows the system first, remembers the choice, no flash on load).
- [x] Preview panel: large preview, size previews (56, 48, 20 px), facts (Style, Grid, Name), 2D | 3D switch (disabled except for Critter, with its note).
- [x] Styles panel: ten cards in the designed grid; "3D" badge on Critter only.
- [x] Variations: six, with heading, line and the "Using variation N" note.
- [x] Canvas 2D renderer reading the `AvatarModel`.
- [x] Verify: Playwright screenshots at 1440×900 in light and dark app appearance; compare with the desktop design frames; fix differences. Keyboard: every control reachable with a visible focus state.

## Stage 4: Colour, Background, copy and download
- [x] Colour control (Auto plus swatches) and Background control (Light, Dark, Transparent), applied everywhere at once.
- [x] Checkerboard behind the preview when Transparent.
- [x] Copy PNG (460 px) with "Copied" and "Clipboard blocked" messages.
- [x] Download menu: PNG at 512, 1024, 2048; SVG and STL disabled with "Soon".
- [x] Verify with Playwright: downloaded PNGs have the right pixel size; the Transparent PNG has an alpha channel; changing colour or background leaves the pattern unchanged.

## Stage 5: 3D view for Critter
- [x] Critter height rule in the model (body 1 unit, eyes and mouth +0.25, pupils small dark blocks on top).
- [x] Three.js scene: plain matte boxes, soft lighting, soft ground shadow; no floor or backdrop when Transparent.
- [x] Rotate 360° (drag), zoom (wheel, pinch), no pan. Keyboard rotate and zoom when focused.
- [x] Reset view and four presets (Front, 3/4, Top, Side), plus the hint text.
- [x] Copy PNG and Download PNG use the current camera angle.
- [x] Fallback to 2D with a short message if WebGL is unavailable. Switching to another style returns to 2D.
- [x] Verify with Playwright: screenshots of Critter in 3D for each preset, in Light, Dark and Transparent; no console errors.

## Stage 6: Phone layout
Read the phone design files (see CLAUDE.md). Requirements in 4.10.
- [x] Single-screen editor with tabs Style, Variations, Colour (Colour holds swatches and Background).
- [x] Fixed height for the area above the tab bar on every tab; no vertical page scrolling.
- [x] 3D chips on the preview; Download as a bottom sheet; size previews and facts hidden or behind Details.
- [x] Works with the keyboard open and in both app appearances.
- [x] Verify: Playwright screenshots at 390×650 and 360×600 for each tab, the Download sheet, light and dark; compare with the phone design frames; check no horizontal or vertical page scroll.

## Stage 7: Finish
- [x] Go through the acceptance checklist (REQUIREMENTS section 8) item by item; tick each with the evidence (test name or screenshot path) in the log.
- [x] Accessibility pass: keyboard, focus states, text alternatives, contrast in both appearances, reduced motion. Fix what you find.
- [x] Update `docs/ARCHITECTURE.md` for 3D and the final structure.
- [x] `README.md`: what it is, how to run, build, test.
- [x] Final commit. Fill in the final report below.

## Stage 8: Layout revision
The design was revised (single-screen desktop). Re-read the design files and save fresh copies to `reference/design/` first. Where this stage disagrees with REQUIREMENTS or CLAUDE.md, the new design wins: update those docs and log it.
- [x] 1. Single-screen desktop layout: the page fills the window (640 px high or more; below that it scrolls); the avatar square takes the height left; Styles shows swatches in one row, tiles 5 × 2, Variations as one row of six; 3D controls as chips along the bottom of the preview; Copied, Clipboard blocked, the 3D hint and "3D is available for Critter." as overlays on the preview; the variation note on the Variations heading line; narrow screens keep the stacked layout.
- [x] 3. Large-screen fixes: style tiles capped to roughly square, layout capped at 1000 px high, the same 12 px gap between the two tile rows.
- [x] 4. Top section: header as its own top bar (hairline under it, page colour with a 3% shift, dark-mode button on the right); name field and Shuffle full width above the cards; no tagline on desktop or phone; placeholder "Username, name or any string".
- [x] 5. Background changes only the large preview and the 56/48/20 px size previews; style tiles and variation thumbnails always use Light (desktop and phone).
- [x] 6. Phone: the 3D chips never start a drag when tapped; the shorter header gives the preview more height.
- [x] Verify: screenshots in light and dark at 1440×900, 1920×1080, 1440×640, 1440×600, phone 390×650 and 360×600 (each tab and the Download sheet), Critter 3D on desktop; compare with the design frames and fix differences; no page scroll on desktop at 900 px high and above; nothing cut off at 640 px; chips do not start a drag on touch. Report below.

## Stage 9: Compact desktop revision
The desktop design was revised again (phone unchanged). Refresh `reference/design/` first. Where this stage disagrees with REQUIREMENTS, CLAUDE.md or Stage 8, the new design wins: update the docs and log it.
- [x] 1. Copy PNG and Download become icon-only buttons in the preview header, next to 2D | 3D; the Download menu opens downward from the header; both keep a tooltip and an accessible name.
- [ ] 2. Background (Light, Dark, Transparent) becomes three icon-only swatch buttons in the preview header, each with a tooltip and accessible name; the "Preview" heading is visually hidden but kept for screen readers.
- [ ] 3. Compact style tiles (12 px name, smaller 3D badge, no grid caption), smaller variation thumbnails, and the Styles card at its natural height at the top.
- [ ] 4. Tiles fill the width and wrap instead of a fixed 5 × 2 grid.
- [ ] 5. The visible "Colour" label is removed on desktop; screen readers still get "Colour" as the swatch group's name. The phone keeps its label.
- [ ] 6. Everything more compact on desktop (top bar, title, input, Shuffle, switch, icons, chips, swatches, menu rows, card padding, heading and facts type). Desktop controls may go below 40 px; the phone keeps 40 px.
- [ ] Verify: screenshots in light and dark at 1440×900, 1920×1080, 1280×720, 1440×640 and 1024×768, plus Critter 3D, the Download menu open, Background Dark and Transparent, and a variation selected; compare with the design and fix; no page scroll from 900 px high; nothing cut off at 640 px; the menu stays on screen; tiles wrap; phone at 390×650 and 360×600 unchanged. Report below.

---

## Decisions and open questions
(Add a dated line whenever you chose between options or found a disagreement. Example: "Stage 3: design shows X, REQUIREMENTS says Y; followed REQUIREMENTS.")

- 2026-10-27 Stage 0: the prototype was shipped at `docs/prototype.html`, not `reference/prototype.html` as CLAUDE.md says. Copied it to `reference/prototype.html` (the docs copy is left untouched); tests read the `reference/` copy.
- 2026-10-27 Stage 0: npm resolved TypeScript 7 and Vite 8. Used a single `tsconfig.json` with `tsc --noEmit` for `typecheck` and before `vite build`, instead of project references.
- 2026-10-27 Stage 0: added `@fontsource/instrument-sans` and `@fontsource/jetbrains-mono` (dependencies not in the stack list). The design uses these fonts; self-hosting them keeps the app free of third-party network requests (Principle 3, Private).
- 2026-10-27 Stage 1: `AvatarCell` has optional fields beyond x, y, height, colour and kind: `w`/`h` (sub-cell footprint for Critter pupils), `z` (3D base elevation), and `dx`/`dy`/`grow` (2D-only offset and outline growth for Sticker's shadow and outline). `AvatarModel` also carries `padding` (empty margin in cells) so every flat renderer frames the avatar the same way. Needed so renderers read nothing but the model.
- 2026-10-27 Stage 2: Dark palettes are new (the prototype only had Light, apart from Midnight, Invader and Aurora). Classic Dark reuses the removed Midnight style's colours; Invader and Aurora Dark keep the prototype's exact colours (backgrounds `#0f131a` / `#10131b`, "about #0d1117"). All other Dark backgrounds are `#0d1117`. Sticker's outline and shadow turn light on Dark so the sticker edge stays visible.
- 2026-10-27 Stage 2: the prototype's Light palettes are kept exactly (parity), so yellow cells on Light sit near 1.4:1 contrast, as they always did. The two new Light palettes (Invader, Aurora) darken hues 35°–200° to 36% lightness (others 45%) so they reach at least 2.5:1; this is slightly below the "roughly 40%" band in 4.4 but keeps them readable.
- 2026-10-27 Stage 1: the parity test compares pixels, not just cell lists: it runs the prototype's own draw functions (extracted from `reference/prototype.html`) and the new engine + canvas renderer into an in-memory raster. Invader and Aurora are compared on the Dark background, because the prototype only drew them dark.
- 2026-10-27 Stage 3: design and REQUIREMENTS differ in a few places; followed REQUIREMENTS for behaviour and copy: name placeholder "Username, name…" (design: "hello-world"); swatch hues 0, 28, 48, 100, 160, 190, 215, 250, 285, 320 (design: 2, 25, 48, 85 …); Shuffle uses the prototype's git words (design: a fixed list of names); variations use `name:N` in the field (design: an internal `#N`). The design's pattern code is a mock-up; the engine is the prototype port.
- 2026-10-27 Stage 3: style cards show name and grid only (design + Decisions log "Cards show the name and grid only"), not the note from 4.2. The facts list shows the style name only ("Classic"), as in the design.
- 2026-10-27 Stage 3: the app opens on Classic (design default) and makes 3D easy to find with the always-visible note "3D is available for Critter." plus the design's "Try it" link, which selects Critter and switches to 3D.
- 2026-10-27 Stage 3: kept the design's "Use original" link next to "Using variation N"; it sets the field back to the name without the suffix.
- 2026-10-27 Stage 3: swatch accessible names are colour plus hue, for example "Blue, hue 215°"; the Auto swatch has no text, only the tooltip and accessible name "Auto, colour from the name" (design).
- 2026-10-27 Stage 3: Colour, Background, Copy PNG and the Download menu were built with the desktop layout because they are part of the designed panels; they are verified and ticked in Stage 4.
- 2026-10-27 Stage 3: the design's rendered frames could not be opened as images (Claude Design's own format needs its runtime), so comparison was against the design's markup and inline styles: sizes, spacing, colours, radii and copy were copied from it.
- 2026-10-27 Stage 4: download file names replace characters that file systems reject (`\ / : * ? " < > |` and spaces) with "-", so `hello-world:3` downloads as `hello-world-3-classic-1024.png`.
- 2026-10-27 Stage 4: the "Copied" message hides after 3 s, the "Clipboard blocked. Use Download instead." message after 6 s (design copy).
- 2026-10-27 Stage 5: the character stands upright: grid rows go up the y axis and cell heights extrude towards the viewer, so Front shows the same face as 2D. A true overhead "Top" view would only show a thin strip of block tops, so Top looks steeply down from 70° above. Side is a 90° profile, 3/4 is 32° round and 22° up (the design's default angle), Front is straight on.
- 2026-10-27 Stage 5: dragging clears the pressed angle preset; zooming keeps it. Zoom is also on the design's − / + buttons. Two-finger touch zooms (pinch) with panning switched off; right-drag rotates instead of panning.
- 2026-10-27 Stage 5: Copy PNG and Download PNG in 3D re-render the current camera at the export size (460, 512, 1024 or 2048 px) by resizing the WebGL drawing buffer for one frame, so exports are sharp and match the on-screen angle.
- 2026-10-27 Stage 5: if the device has no WebGL, or the 3D view throws, the switch stays on 2D and the note under it reads "3D is not available on this device." (copy not given in REQUIREMENTS).
- 2026-10-27 Stage 5: three.js, R3F and drei load in a separate chunk only when 3D is opened (main bundle ~250 kB, 3D chunk ~935 kB); `chunkSizeWarningLimit` raised to 1000 kB for that chunk. The 3D view renders on demand (no render loop), so nothing animates.
- 2026-10-27 Stage 6: the phone editor is used below 641 px wide (`(max-width: 640px)`); wider screens get the desktop layout, which wraps the Styles panel under the Preview on tablets. The design's long-scroll "Phone, default" frames (400 × 2640) were treated as the stacked desktop layout; REQUIREMENTS 4.10 asks for the single-screen editor on phones, so that is what phones get.
- 2026-10-27 Stage 6: on the phone the preview is the design's square, except (a) in 3D and (b) on short screens (stage area under 230 px tall, e.g. 360 × 600), where it takes the full width so the "3D is available for Critter. Try it" note and the five angle chips fit on one line instead of covering the avatar. The avatar keeps the same size.
- 2026-10-27 Stage 6: "keyboard open" is detected from the name field's focus (the design's `kbd` state hides the tab panel and the action row) and the editor sizes itself to `visualViewport.height`, so it fits above an on-screen keyboard. Playwright cannot open a real keyboard; it was simulated with focus plus a 380 px tall viewport (the design's keyboard frame).
- 2026-10-27 Stage 6: on short phones the "Enter anything to see your avatar" label is visually hidden but kept for screen readers (design rule `max-height: 700px`).
- 2026-10-27 Stage 7: pinch zoom is configured (OrbitControls two-finger dolly, pan off) but Playwright cannot synthesise a two-finger pinch, so it is not covered by an automated check; wheel, keyboard and button zoom are.
- 2026-10-27 Stage 7: one verify-ui check ("app appearance never changes the avatar") failed once in the final run because it sampled the preview canvas right after it re-mounted from 3D, before its first resize-and-draw. The test now waits for the canvas to settle; it then passed in 4 runs in a row. The app itself was not changed for this.
- 2026-10-27 Stage 7: accessibility fixes from the pass: the phone editor gained a `main` landmark, and "Try it" now moves focus to the 3D view (it used to vanish under the keyboard focus).
- 2026-10-27 Stage 8: the design caps the tile rows with `100cqw` on the tile grid itself, but container units resolve against an ancestor container, so in the design the cap never applies (it falls back to the window width). The app makes the Styles card the container and subtracts its 40 px padding, which gives the intended roughly square tiles (155 × 215 px tile, 133 px art at 1920 × 1080).
- 2026-10-27 Stage 8: the new design removes the tagline from the header (desktop and phone) and changes the placeholder to "Username, name or any string". REQUIREMENTS 4.1, 7 and 9 and CLAUDE.md updated; the tagline stays in the README and the page's meta description.
- 2026-10-27 Stage 8: at 640 px high the design's spacing leaves the avatar about 36 px and the tile art about 5 px (it was calculated, not checked). Windows 640–799 px high therefore get tighter spacing: the Background label sits beside its control, the preview fills the width left (so the 3D note and chips stay on one line), tiles hide the grid line, 3D chips are 30 px, and variation thumbnails are 56 px. From 800 px high the design's numbers are used unchanged. The size previews and facts never wrap in the single-screen layout (they wrapped at the 380 px minimum panel width).
- 2026-10-27 Stage 8: Background (Light, Dark, Transparent) now changes only the large preview, the 3D scene, the size previews and exports. Style tiles and variation thumbnails always render with the Light palette, on desktop and phone (new design). REQUIREMENTS 4.4 and 9 updated. This replaces the Stage 4 behaviour "applied everywhere at once".
- 2026-10-27 Stage 8: the design stops a 3D drag from starting on a chip by checking the pointer target. In the app the chips already sit outside the 3D view's event area (they are overlays beside the canvas, not inside it), so a touch that starts on a chip never reaches the camera controls. The chips also get `touch-action: manipulation`. A new verify-ui check slides a real touch (CDP touch events) from a chip across the view and asserts the frame and preset are unchanged.
- 2026-10-27 Stage 9: Copy PNG and Download are icon-only buttons in the desktop preview header (accessible names and tooltips "Copy PNG" and "Download"); the menu opens downward from there. The labelled Download button is gone, so `DownloadMenu` is now icon-only; the phone keeps its labelled buttons and bottom sheet.

## Log
(One short line per stage when finished: what was built, checks run, anything skipped or `[!]`.)

- Stage 0: Vite + React 19 + TS strict scaffold, three / R3F / drei, Vitest, Playwright 1.64 (dev), folders, git. Smoke test, typecheck and build pass.
- Stage 1: engine in `src/engine/` (hash, RNG, mirror/ensure, base 5×5, ten styles), canvas renderer in `src/render/canvas.ts`. 28 tests incl. pixel parity with the prototype for all ten styles over 8 names (empty, 40 chars, non-Latin) and 3 hue overrides.
- Stage 2: hue override and Light / Dark / Transparent palettes for all ten styles; 45 tests (pattern invariance over 3 backgrounds × 11 hue settings × 13 names, transparent = no background, lightness bands, contrast, Duotone/Kaleido second hue). `docs/ARCHITECTURE.md` written.
- Stage 3: desktop UI from the design (tokens for light and dark, header with theme toggle and no-flash inline script, name field, Preview panel, Styles panel, Variations, canvas renderer). `scripts/verify-ui.mjs` (desktop + keyboard sections): 64 checks pass incl. no console errors; screenshots `docs/screenshots/desktop-1440-light.png`, `desktop-1440-dark.png`, `desktop-focus-visible.png`.
- Stage 4: verify-ui `export` section, 26 checks: pattern mask unchanged across hue/Dark/Transparent, cards follow Background, checkerboard, Download menu with disabled SVG/STL "Soon", PNG 512/1024/2048 real pixel sizes, RGBA with transparent corner, file name `hello-world-classic-1024.png`, Copy PNG reads back as 460×460 from the clipboard, blocked-clipboard message. Screenshots `desktop-bg-dark-blue.png`, `desktop-bg-transparent.png`, `desktop-download-menu.png`, `desktop-copied.png`, `desktop-clipboard-blocked.png`.
- Stage 5: Critter height rule (`src/engine/heights.ts`, 4 new tests, 56 total), instanced matte boxes with contact shadow (`src/ui/Scene3D.tsx`, layout in `src/render/scene3d.ts`), orbit rotate/zoom with pan off, keyboard, presets, Reset view, 3D capture for Copy/Download, WebGL fallback. verify-ui `three` section: 51 checks (presets × Light/Dark/Transparent, drag, wheel, pan attempts keep it centred, Reset restores the exact frame, keys, downloads follow the angle, transparent 3D PNG, 460 px copy, no-WebGL fallback). Screenshots `docs/screenshots/critter-3d-{light,dark,transparent}-{front,three-quarter,top,side}.png`. Only console warnings (three.js `Clock` deprecation from R3F, SwiftShader ReadPixels notices), no errors.
- Stage 6: phone editor (`src/ui/PhoneEditor.tsx`, `PhoneTabs`, `DownloadSheet`, `src/styles/phone.css`). verify-ui `phone` section, 93 checks at 390×650 and 360×600 in light and dark: every tab, fixed dock position across tabs, no vertical or horizontal page scroll (also in 3D and with the keyboard open), bottom sheet with disabled SVG/STL, sheet download, 3D chips, touch hint, style/variation/colour/background/copy flows, arrow keys on tabs, 400 px wide desktop has no scroll. Fixed during review: Download icon squeezed at 360 px, 3D note and chips wrapping over the avatar. Screenshots `docs/screenshots/phone-*.png`.
- Stage 7: acceptance checklist (REQUIREMENTS 8), each with evidence:
  - [x] Same avatar for `hello-world` in every style, after reload and on another machine: engine is pure and seeded only by the name (`tests/engine.test.ts` "gives identical output for identical input"; `tests/parity.test.ts` pixel parity with the prototype for all ten styles).
  - [x] Background changes colours only: `tests/options.test.ts` "never change which cells are filled"; verify-ui `export` "changing background leaves the pattern unchanged", "Transparent leaves the pattern unchanged".
  - [x] Colour changes hue only: `tests/options.test.ts` "a swatch overrides only the hue"; verify-ui `export` "changing colour leaves the pattern unchanged".
  - [x] Auto returns to the name's colour: `tests/options.test.ts` "Auto returns to the name's own colour"; verify-ui `export` PNG after picking Auto matches the Light preview.
  - [x] All ten styles in Light and Dark, Invader and Aurora readable in Light: `tests/options.test.ts` lightness band and contrast tests (Invader/Aurora ≥ 2.5:1 on Light); `docs/screenshots/desktop-1440-light.png`, `desktop-bg-dark-blue.png`.
  - [x] Transparent shows a checkerboard and gives a PNG with transparency: verify-ui `export` "checkerboard behind the preview", "PNG has an alpha channel", "Transparent PNG corner is transparent"; `three` "Transparent 3D download has a transparent background"; `docs/screenshots/desktop-bg-transparent.png`.
  - [x] 3D works for Critter, disabled with "3D is available for Critter." for the other nine: verify-ui `desktop` "3D switch disabled for Classic", "3D note visible", "3D switch enabled for Critter"; `three` "another style returns to 2D".
  - [x] 3D drag rotates, wheel zooms, no pan, Reset view, four presets: verify-ui `three` (drag, wheel, right/shift/ctrl-drag keep it centred, Reset restores the exact frame, four distinct presets); `docs/screenshots/critter-3d-*.png`. Pinch: configured, not automatable (see Decisions).
  - [x] Copy PNG and Download 512/1024/2048 match the screen, incl. the 3D angle: verify-ui `export` (pixel sizes, Light preview pixel, 460 px clipboard image) and `three` ("download follows the camera angle", 3D copy 460 px).
  - [x] SVG and STL visible, disabled, "Soon": verify-ui `export` and `phone`; `docs/screenshots/desktop-download-menu.png`, `phone-390x650-light-download-sheet.png`.
  - [x] No circle crop; the only moon/sun control is the header toggle: no crop code in `src/` (only `<circle>` is in the sun icon); screenshots.
  - [x] Toggle switches the whole app immediately, no reload: verify-ui `desktop` "toggle switches to dark", "toggle label flips".
  - [x] First visit follows the system; choice survives a reload: verify-ui `desktop` "first visit follows a dark system", "choice survives a reload".
  - [x] No flash of the light theme when reloading in dark: verify-ui `desktop` "dark theme applied before the app script runs", "page background is dark before first app paint" (app bundle held back while sampling).
  - [x] App appearance never changes the avatar, the Background setting, the 3D scene or exports: verify-ui `desktop` "app appearance never changes the avatar"; `export` "never changes the exported PNG", "never changes the avatar Background setting"; `three` "never changes the 3D scene or its background".
  - [x] 400 px wide with no horizontal scroll, and keyboard only: verify-ui `phone` "400 px wide: no page scroll" plus every phone size; `keyboard` and `a11y` sections (every control reached with Tab, visible focus ring, Enter picks a style); `docs/screenshots/desktop-focus-visible.png`.
  - [x] Empty, 40-character and non-English names work: `tests/engine.test.ts` sample names (empty, 40 × "x", José Martí, 山田太郎, مرحبا, emoji); verify-ui `desktop` "empty name uses hello-world", "non-English name", 40-character limit.
- Stage 7: accessibility pass (verify-ui `a11y`, 26 checks: text alternatives on every avatar, one main landmark per layout, labelled field, named buttons, focus after "Try it", no transitions or animations with reduced motion, phone keyboard reach) and `tests/ui-contrast.test.ts` (all text tokens ≥ 4.5:1 in both appearances). ARCHITECTURE.md updated for 3D and the final structure; README.md written. Final run: 59 unit tests, typecheck and build pass; `npm run verify:ui` 261 checks pass, 0 console errors.
- Stage 8: layout revision from the updated design (fresh copies in `reference/design/project/`, incl. the new DesktopWide, DesktopCritter3D and dark frames). Single-screen desktop from 1000 px wide, overlays and 3D chips on the preview, top bar header, no tagline, new placeholder, tiles/variations always Light, large-screen caps, short-window spacing. New verify-ui `layout` section (114 checks: no page scroll at 1440×900, 1920×1080 and 1440×640 in light and dark; 1440×600 scrolls to a 640 px layout; nothing clipped; 5 × 2 tiles, one swatch row, one row of six variations; 12 px tile row gap; tiles not stretched; ≤ 1000 px high; 3D chips on one line; 800 px wide stays stacked) plus phone chip touch-drag and Light-tile checks. Final run: 59 unit tests, typecheck, build, `npm run verify:ui` 390 checks, 0 failed, 0 console errors. Screenshots: `docs/screenshots/desktop-{1440x900,1920x1080,1440x640,1440x600}-{light,dark}.png`, `desktop-*-critter-3d.png`, `desktop-800x900-light-stacked.png`, `phone-*`.

## Final report
(Fill in at the end: what works, what was skipped or blocked, what the user should look at first, known gaps.)

**What works.** Everything in the MVP scope of `REQUIREMENTS.md`: name field with Shuffle and the 40-character limit; ten styles ported from the prototype (pixel-identical to it); Colour (Auto + ten hues) and Background (Light, Dark, Transparent) applied to every card, preview, size preview, variation, the 3D scene and exports; six variations with "Using variation N" and "Use original"; Copy PNG (460 px) with Copied / Clipboard blocked messages; Download menu with PNG 512 / 1024 / 2048 and disabled SVG / STL "Soon" items; a 3D view for Critter (matte instanced boxes, raised eyes and mouth, pupils on top, soft ground shadow, rotate and zoom with no pan, Front / 3/4 / Top / Side, Reset view, keyboard, exports at the current angle, 2D fallback without WebGL); the app light/dark toggle (follows the system first, remembers the choice, no flash); the single-screen phone editor with Style / Variations / Colour tabs and a Download bottom sheet. Checks: 59 Vitest tests, strict typecheck, production build and 261 Playwright checks all pass with no console errors.

**Nothing was blocked or skipped.** No `[!]` items.

**Look at first.**
1. `npm run dev`, then click "Try it" under the Preview switch to see Critter in 3D.
2. `docs/screenshots/` for every state (desktop light/dark, backgrounds, menu, 3D presets in each background, phone tabs and sheet at 390×650 and 360×600, keyboard open).
3. The Decisions list above, especially where the design and REQUIREMENTS differed (placeholder, hue values, Shuffle words, card notes) and the 3D "Top" angle.

**Known gaps.**
- Pinch zoom is configured but untested by automation (Playwright cannot pinch). Worth a try on a real phone.
- The prototype's own Light palettes are kept exactly, so yellow-ish avatars on Light have low contrast (about 1.4:1), as they always did. Only the new Invader and Aurora Light palettes were tuned for contrast.
- The design's canvas frames could not be rendered as images here (Claude Design format), so the comparison was against the design's markup and inline styles rather than pixel screenshots of the design.
- On the smallest phone (360 × 600) the 3D view is short (about 130 px tall); pinch or the zoom keys make it bigger.
- The 3D chunk (three.js + drei) is about 935 kB (250 kB gzip). It only loads when 3D is opened.
- Console shows warnings (not errors) from libraries in 3D: three.js `Clock` deprecation inside R3F, and SwiftShader "ReadPixels" performance notices in headless Chrome.

### Stage 8 report (layout revision)

**What changed.**
- Desktop (1000 px wide and up) is one screen. It fills the window from 640 px high (shorter windows scroll) and the content is capped at 1000 px high. The avatar square takes the height that is left, and the Styles card shows one row of swatches, 5 × 2 tiles and one row of six variations.
- Copied, Clipboard blocked, the 3D hint and "3D is available for Critter. Try it" are now overlays on the preview. The 3D controls (Front, 3/4, Top, Side, −, +, Reset view) are chips along its bottom edge, and "Using variation N · Use original" sits on the Variations heading line. Windows narrower than 1000 px keep the stacked, scrolling layout.
- The header is a top bar with a hairline and a 3% tinted background, and the dark-mode button sits on the right. The name field and Shuffle span the full width above the cards. The tagline is gone from desktop and phone, and the placeholder reads "Username, name or any string".
- Background now changes only the large preview, the 3D scene, the 56/48/20 px size previews and exports. Style tiles and variation thumbnails always show Light, on phone too.
- Phone: removing the tagline gives the preview 18 px more height. 3D chips cannot start a drag (now checked with real touch events).
- Code: new `PreviewOverlays` is shared by desktop and phone. `ViewControls` is chips only. The `background` props were removed from `StyleGrid` and `Variations`. REQUIREMENTS (4.1, 4.4, 7, 9), CLAUDE.md and ARCHITECTURE.md were updated to match.

**What was checked.** 59 unit tests, typecheck and build. `npm run verify:ui` passes 390 checks with 0 console errors:
- Light and dark at 1440×900, 1920×1080, 1440×640 and 1440×600.
- Critter in 3D at 1440×900 and 1440×640 in both themes, and at 1920×1080 in light.
- Phone at 390×650 and 360×600 on every tab and the Download sheet, in both themes, with the keyboard open.
- An 800 px wide stacked layout.

I looked at the screenshots against the design's markup and styles (its frames still can't be rendered here).

**Where the app differs from the design** (each is logged under Decisions):
1. The design's tile-row cap used container units on the grid itself, so it never applied. The app measures from the Styles card instead.
2. At 640 px high the design's numbers leave a 36 px avatar and 5 px tile art. Windows 640–799 px high get tighter spacing:
   - the Background label sits beside its control;
   - the preview fills the width;
   - tiles hide the grid line;
   - chips are 30 px and variation thumbnails 56 px.
   From 800 px high the design's values are used unchanged.
3. The size previews and facts never wrap in the single-screen layout. They wrapped at the 380 px panel width.

**Please look at.**
- `desktop-1440x640-light.png`: the compact mode works, but the avatar and tiles are small (preview about 183 px, tile art about 70 px). Decide whether 640 should stay the minimum height.
- `desktop-1920x1080-*.png`: because the tiles are capped, there is a band of empty space between the tiles and Variations on tall windows. That follows the design (tiles aligned to the top), but you may prefer Variations to sit directly under the tiles.
- Pinch zoom is still untested by automation.

