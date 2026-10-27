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
- [ ] Single-screen editor with tabs Style, Variations, Colour (Colour holds swatches and Background).
- [ ] Fixed height for the area above the tab bar on every tab; no vertical page scrolling.
- [ ] 3D chips on the preview; Download as a bottom sheet; size previews and facts hidden or behind Details.
- [ ] Works with the keyboard open and in both app appearances.
- [ ] Verify: Playwright screenshots at 390×650 and 360×600 for each tab, the Download sheet, light and dark; compare with the phone design frames; check no horizontal or vertical page scroll.

## Stage 7: Finish
- [ ] Go through the acceptance checklist (REQUIREMENTS section 8) item by item; tick each with the evidence (test name or screenshot path) in the log.
- [ ] Accessibility pass: keyboard, focus states, text alternatives, contrast in both appearances, reduced motion. Fix what you find.
- [ ] Update `docs/ARCHITECTURE.md` for 3D and the final structure.
- [ ] `README.md`: what it is, how to run, build, test.
- [ ] Final commit. Fill in the final report below.

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

## Log
(One short line per stage when finished: what was built, checks run, anything skipped or `[!]`.)

- Stage 0: Vite + React 19 + TS strict scaffold, three / R3F / drei, Vitest, Playwright 1.64 (dev), folders, git. Smoke test, typecheck and build pass.
- Stage 1: engine in `src/engine/` (hash, RNG, mirror/ensure, base 5×5, ten styles), canvas renderer in `src/render/canvas.ts`. 28 tests incl. pixel parity with the prototype for all ten styles over 8 names (empty, 40 chars, non-Latin) and 3 hue overrides.
- Stage 2: hue override and Light / Dark / Transparent palettes for all ten styles; 45 tests (pattern invariance over 3 backgrounds × 11 hue settings × 13 names, transparent = no background, lightness bands, contrast, Duotone/Kaleido second hue). `docs/ARCHITECTURE.md` written.
- Stage 3: desktop UI from the design (tokens for light and dark, header with theme toggle and no-flash inline script, name field, Preview panel, Styles panel, Variations, canvas renderer). `scripts/verify-ui.mjs` (desktop + keyboard sections): 64 checks pass incl. no console errors; screenshots `docs/screenshots/desktop-1440-light.png`, `desktop-1440-dark.png`, `desktop-focus-visible.png`.
- Stage 4: verify-ui `export` section, 26 checks: pattern mask unchanged across hue/Dark/Transparent, cards follow Background, checkerboard, Download menu with disabled SVG/STL "Soon", PNG 512/1024/2048 real pixel sizes, RGBA with transparent corner, file name `hello-world-classic-1024.png`, Copy PNG reads back as 460×460 from the clipboard, blocked-clipboard message. Screenshots `desktop-bg-dark-blue.png`, `desktop-bg-transparent.png`, `desktop-download-menu.png`, `desktop-copied.png`, `desktop-clipboard-blocked.png`.
- Stage 5: Critter height rule (`src/engine/heights.ts`, 4 new tests, 56 total), instanced matte boxes with contact shadow (`src/ui/Scene3D.tsx`, layout in `src/render/scene3d.ts`), orbit rotate/zoom with pan off, keyboard, presets, Reset view, 3D capture for Copy/Download, WebGL fallback. verify-ui `three` section: 51 checks (presets × Light/Dark/Transparent, drag, wheel, pan attempts keep it centred, Reset restores the exact frame, keys, downloads follow the angle, transparent 3D PNG, 460 px copy, no-WebGL fallback). Screenshots `docs/screenshots/critter-3d-{light,dark,transparent}-{front,three-quarter,top,side}.png`. Only console warnings (three.js `Clock` deprecation from R3F, SwiftShader ReadPixels notices), no errors.

## Final report
(Fill in at the end: what works, what was skipped or blocked, what the user should look at first, known gaps.)

-
