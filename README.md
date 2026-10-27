# Brickyard

Pixel avatars for people who hate profile pictures.

Brickyard turns any name into a pixel avatar in the style of GitHub's identicons. Type a name, pick
one of ten styles, choose a colour and a background, and copy or download a PNG. The Critter style
also has a 3D view built from blocks that you can rotate and zoom.

- The same name always gives the same avatar, on every machine.
- Everything runs in your browser. No accounts, no uploads, no backend.
- Light and dark app appearance, with a toggle in the header.

## Run it

Needs Node 20 or newer.

```sh
npm install
npm run dev        # http://localhost:5173
```

## Build, test, check

```sh
npm run build      # production build into dist/
npm test           # unit tests (Vitest)
npm run typecheck  # TypeScript, strict
```

End-to-end checks and screenshots (Playwright, Chromium):

```sh
npx playwright install chromium   # once
npm run build
npm run verify:ui                 # or: npm run verify:ui -- phone
```

This starts `vite preview`, clicks through the main flows on desktop and phone sizes, checks
downloads and the clipboard, and saves screenshots to `docs/screenshots/`. Sections: `desktop`,
`export`, `three`, `phone`, `keyboard`, `a11y`.

## How it is built

- `src/engine/`: the avatar engine, pure TypeScript.
  `generateAvatar(name, { style, hue, background })` returns an `AvatarModel` (grid size,
  background, cells). The hashing, random numbers and style rules are ported unchanged from
  `reference/prototype.html`; a test compares both pixel by pixel.
- `src/render/`: renderers that read only the model: a 2D canvas renderer and the 3D layout.
- `src/ui/`, `src/styles/`: React interface, plain CSS with variables for light and dark.

See `docs/ARCHITECTURE.md` for details, `docs/REQUIREMENTS.md` for the product spec, and
`docs/TASKS.md` for the build log and decisions.
