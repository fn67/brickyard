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
| `src/render/` | Renderers that read an `AvatarModel` and nothing else. |
| `tests/` | Vitest tests, including pixel parity with `reference/prototype.html`. |

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
- 3D (Critter) — see the 3D section, added in Stage 5.

## Adding a style

1. Add its id to `StyleId` and a builder to `BUILDERS` in `styles.ts` (with a Light and a Dark palette).
2. Add its entry to `STYLES` in `catalog.ts`.
3. The tests in `tests/engine.test.ts` and `tests/options.test.ts` run over every style automatically.
