# Brickyard

Brickyard turns any name into a pixel avatar in the style of GitHub's identicons. Tagline: "Pixel avatars for people who hate profile pictures." (README and page description only; the app header no longer shows it.)

## How to work (autonomous, resumable)
You are building this app in one unattended run. Nobody is watching, so do not stop to ask questions.
1. Read `docs/REQUIREMENTS.md` (what to build) and `docs/TASKS.md` (the build plan and progress).
2. Find the first unchecked item in `docs/TASKS.md` and continue from there. If the user says only "continue" or "go to the tasks", this is what they mean. Never redo ticked items; if one looks broken, fix it and note it in the log.
3. Work through every stage in order without stopping between stages. Tick each item as soon as it is done, and commit at the end of each stage.
4. If something is unclear or two sources disagree, pick the most reasonable option, write a line in the "Decisions and open questions" section of `docs/TASKS.md`, and carry on. `docs/REQUIREMENTS.md` wins over the design for behaviour and wording; the design wins for look.
5. If something is blocked, mark the item `[!]` with the reason in the log, skip to the next item that does not depend on it, and come back at the end.
6. Finish by filling in the final report in `docs/TASKS.md`.

## Design
The UI design is in Claude Design: https://claude.ai/code/artifact/21134688-bf44-4c72-876c-de1cf1a590bb
Read its files from that link before Stage 3 (and Stage 6). The main files are `project/Brickyard.dc.html` (desktop) and `project/BrickyardPhone.dc.html` (phone); `project/Foundations.dc.html` holds the shared colours, type and spacing; the other `.dc.html` files are the same screens in other states (dark, Download sheet, keyboard open, small phone). They are in Claude Design's own format, not React: take the layout, spacing, colours, fonts and copy, and rebuild them as React components. If the link cannot be read, build from `docs/REQUIREMENTS.md` section 7 and 4.10, and log that.
Save copies of the key files you read into `reference/design/` so later sessions do not need the link.

## Stack
- Vite, React, TypeScript (strict)
- three.js through `@react-three/fiber` and `@react-three/drei` (3D view only)
- Plain CSS with CSS variables (light and dark)
- Vitest for unit tests; Playwright (already available in the environment, or install it as a dev dependency) for screenshots
- No backend, no Next.js. Do not add other dependencies unless a task needs them; log it if you do.

## Commands
Stage 0 creates these. Keep this list current.
- `npm run dev`: start the dev server
- `npm run build`: production build
- `npm test`: run the tests
- `npm run typecheck`: TypeScript check
- `npm run verify:ui`: Playwright screenshots and click-through of the main flows (needs `npm run build` first; writes to `docs/screenshots/`)

## Folders
- `docs/`: `REQUIREMENTS.md`, `TASKS.md`, later `ARCHITECTURE.md`
- `reference/prototype.html`: the prototype. Source for the hashing, seeded random numbers, mirroring and draw functions. It has twelve styles; only the ten in `REQUIREMENTS.md` 4.2 are built (no Midnight, no Dots).
- `src/engine/`: the avatar engine
- `src/ui/`, `src/styles/`: the interface

## Rules that are easy to get wrong
- **The engine is pure TypeScript.** No React, DOM or canvas inside `src/engine/`. `generateAvatar(seed, { style, hue, background })` returns an `AvatarModel` (grid size, background, cells with x, y, height, colour, optional kind). Every renderer (2D canvas, 3D, later SVG and STL) reads that model and nothing else.
- **Do not "improve" the pattern logic.** Port the hash, random number generator and style rules from the prototype exactly, so existing names give the same avatars.
- **Same name, same avatar.** Changing background, hue or view must never change which cells are filled. Tests must prove it.
- **The word "seed" never appears in the interface.** The UI calls it the name. UI copy is fixed in `REQUIREMENTS.md` and the design; do not reword it.
- **3D is for Critter only.** Matte plain boxes, no studs, no bevels. Rotate and zoom only, no pan, no auto-rotate, no animation.
- **UI colours are CSS variables for both appearances.** Avatar colours and the 3D scene background follow the Background control (Light, Dark, Transparent), not the app appearance.
- **Not in the MVP:** circle crop, depth slider, isometric preset, share link, batch mode, working SVG and STL download, auto-rotate. SVG and STL appear in the Download menu as disabled "Soon" items.

## Verification (no human check)
Because nobody reviews the UI during the run, check it yourself:
- After each stage run `npm test`, `npm run typecheck` and `npm run build`. All three must pass before you tick the stage.
- For UI stages, use Playwright to take screenshots at the sizes in the task, look at them, compare with the design, list the differences, and fix them. Save final screenshots in `docs/screenshots/`.
- Also use Playwright to click through the main flows (type a name, pick a style, change colour and background, switch to 3D, open the Download menu, toggle app dark mode) and fail loudly on console errors.

## Code style
- TypeScript strict. Small functions. Named exports.
- Plain CSS files. No inline styles except values that must be dynamic.
- Comments only where the logic is not obvious.
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`).
