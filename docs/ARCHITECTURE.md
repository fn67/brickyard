# Brickyard architecture

One page on what was actually built. Behaviour and copy live in `REQUIREMENTS.md`.

## Folder map

| Path | What it holds |
|---|---|
| `src/engine/` | The avatar engine. Pure TypeScript: no React, DOM or canvas. |
| `src/engine/types.ts` | `AvatarModel`, `AvatarCell`, `StyleId`, `BackgroundMode`, `AvatarOptions`. |
| `src/engine/random.ts` | `hashString`, `makeRng` (Mulberry32), `hsl`. Ported unchanged from the prototype. |
| `src/engine/grid.ts` | `mirror`, `ensure`, `forEachCell`, `emptyGrid`. |
| `src/engine/styles.ts` | The ten style builders, with Light and Dark palettes. |
| `src/engine/generate.ts` | `generateAvatar(seed, { style, hue, background })`. |
| `src/engine/catalog.ts` | Style names, grid labels, notes, which style has 3D, the ten hues. |
| `src/engine/names.ts` | Default name, Shuffle words, variation helpers (`:1`, `:2` …). |
| `src/engine/heights.ts` | 3D height rules per style (only Critter in the MVP). |
| `src/render/canvas.ts` | Flat renderer: `drawAvatar(ctx, model, size)`. |
| `src/render/scene3d.ts` | 3D layout: model cells → box matrices and colours, ground height, camera offsets. |
| `src/render/presets.ts` | Angle presets and zoom limits (no three.js, so the main bundle stays small). |
| `src/ui/` | React components and hooks (see "Interface" below). |
| `src/styles/` | `tokens.css` (light and dark CSS variables), `base.css`, `desktop.css`, `phone.css`. |
| `tests/` | Vitest tests, including pixel parity with `reference/prototype.html` and UI token contrast. |
| `scripts/verify-ui.mjs` | Playwright checks and screenshots (`npm run verify:ui`). |

## The model

```ts
interface AvatarModel {
  style: StyleId; seed: string;
  width: number; height: number;   // grid size in cells
  padding: number;                 // empty margin in cells (1 for most styles, 0 for Quilt)
  background: string | null;       // null = transparent
  cells: AvatarCell[];             // in paint order
}
interface AvatarCell {
  x: number; y: number;            // grid position (fractional for pupils)
  height: number;                  // 3D extrusion; 0 = 2D-only decoration
  color: string;
  kind?: 'body' | 'second' | 'edge' | 'shadow' | 'outline' | 'eye' | 'pupil' | 'mouth'
       | 'tone-dark' | 'tone-mid' | 'tone-light';
  w?: number; h?: number;          // sub-cell footprint (pupils)
  z?: number;                      // 3D base elevation
  dx?: number; dy?: number; grow?: number; // 2D-only offset / outline growth (Sticker)
}
```

## How a name becomes cells

1. The UI trims the field; an empty field becomes `hello-world`.
2. Each style seeds its own random stream with `makeRng(name, salt)`, where the salt is the style's
   key from the prototype (`g5`, `duo`, `inv`, `crit`, `quilt`, `dit`, `kal`). `makeRng` hashes
   `name + '|' + salt` and runs Mulberry32.
3. The 5×5 styles (Classic, Duotone, Sticker, Quilt's hue, Dither's hue, Aurora, Kaleido's hue and
   the inside of Frame) share `base5`: hue, saturation, lightness, then a mirrored 5×5 grid. So one
   name looks like the same person in every outfit.
4. The style builder lays out the cells exactly as the prototype did. The random calls stay in the
   same order, so the pattern never depends on colour.
5. **Hue:** the builder still draws its own hue from the stream, then replaces it with the chosen hue
   when one is set. Saturation and lightness stay in the style's band.
6. **Background:** picks the Light or Dark palette (cell colours and background), or Light cell
   colours with `background: null` for Transparent. Quilt fills the square, so Dark shifts its tones.

Tests prove that hue and background never change the cells' positions, kinds or sizes.

## Renderers

Every renderer reads only the model.

- `src/render/canvas.ts` — `drawAvatar(ctx, model, size)`: unit `u = size / (width + 2·padding)`,
  cell edges rounded to whole pixels so neighbours never leave hairline gaps. Used for cards,
  previews, variations, Copy PNG and Download PNG.
- `src/render/scene3d.ts` + `src/ui/Scene3D.tsx` — the 3D view (below).

## 3D (Critter only)

- **Heights.** `generateAvatar` runs the style's rule from `HEIGHT_RULES` (`heights.ts`) over the
  cells. Critter: body 1, eyes and mouth 1.25, pupils 0.5 × 0.5 blocks 0.2 deep with `z = 1.25`, on
  top of their eye. Styles without a rule keep height 1 and never reach the 3D view.
- **Layout.** `layoutBlocks(model)` turns every cell with `height > 0` into one box: x right, y up
  (grid row 0 at the top), z towards the viewer, so the Front preset shows the 2D face.
- **Scene.** One `InstancedMesh` of unit boxes with `meshLambertMaterial` (matte, no studs or
  bevels), hemisphere + two directional lights, drei `ContactShadows` on the ground. The scene
  background is the model's background; Transparent has no background and no shadow plane.
- **Camera.** Perspective, 35° fov, orbiting a target in the middle of the avatar. drei
  `OrbitControls` with pan off, no damping, distance 11–36. Presets set azimuth/elevation
  (Front 0/0, 3/4 32/22, Top 0/70, Side 90/0). Arrow keys rotate 10°, +/− zoom. `frameloop="demand"`:
  nothing renders unless something changes, so there is no animation.
- **Capture.** While 3D is shown it registers a `Capture` (`size → canvas`) that resizes the WebGL
  drawing buffer to the export size for one frame, renders the current camera, and copies it out.
  Copy PNG and Download PNG use it, so exports match the on-screen angle.
- **Loading and fallback.** `Scene3D` is lazy-loaded (three.js is a separate chunk). If WebGL is
  missing, or the view throws (`ErrorBoundary`), the app stays in 2D and says
  "3D is not available on this device."
- **Adding 3D to another style.** Add a height rule for it in `HEIGHT_RULES` and set `has3d` in
  `catalog.ts`. No renderer changes.

## Interface

- `App.tsx` picks the layout: the desktop layout (`Header` as a top bar, then `NameField`,
  `PreviewPanel` and `StylesPanel`) or, below 641 px wide, `PhoneEditor` (single screen, tabs,
  bottom sheet).
- **Desktop sizing** is CSS only (`desktop.css`). From 1000 px wide the page is one screen:
  `height: max(100vh, 640px)` (shorter windows scroll), the content is capped at 1000 px high, and
  the preview square and the style tiles take the height left through container queries
  (`.stage-fit`, and `.styles-panel` as the container for the tile row cap). Windows 640–799 px high
  get tighter spacing. Narrower windows use the stacked, scrolling layout.
- **On the preview**, both layouts render `PreviewOverlays` inside `Stage`: the Copied / Clipboard
  blocked messages and the 3D hint along the top, the "3D is available for Critter." note or the 3D
  chips (`ViewControls`: presets, zoom on desktop, Reset view) along the bottom. They sit beside
  the 3D canvas, not inside it, so a press on a chip never starts a drag.
- **Background** applies to the large preview, the size previews, the 3D scene and exports.
  `StyleGrid` and `Variations` always draw with the Light palette.
- State lives in hooks shared by both layouts: `useAvatarState` (name field, style, hue,
  background, view; derives the model and the variation names), `useExport` (Copy / Download,
  messages), `useView3d` (the single 3D scene and its controls), `useAppearance` (app light/dark).
- **App appearance.** Colours are CSS variables in `tokens.css`, with dark values under
  `prefers-color-scheme` (when no choice is saved) and under `[data-theme='dark']`. The toggle
  saves the choice in `localStorage` (`brickyard-appearance`); a tiny inline script in `index.html`
  sets `data-theme` before first paint. Avatars and the 3D scene never use these variables.
- `AvatarCanvas` draws a model into a canvas sized to its box × device pixel ratio; every card,
  preview, size preview and variation is one.

## Adding a style

1. Add its id to `StyleId` and a builder to `BUILDERS` in `styles.ts` (with a Light and a Dark palette).
2. Add its entry to `STYLES` in `catalog.ts` (name, grid label, note, `has3d`).
3. For 3D, add a height rule in `heights.ts`.
4. The tests in `tests/engine.test.ts`, `tests/options.test.ts` and `tests/heights.test.ts` run over
   every style automatically. The UI picks the new style up from `STYLES`.
