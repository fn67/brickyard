import { emptyGrid, ensure, forEachCell, mirror, type Grid } from './grid';
import { hsl, makeRng } from './random';
import type { AvatarCell, AvatarModel, BackgroundMode, CellKind, StyleId } from './types';

// Pattern logic is ported from reference/prototype.html. The random number calls must stay in the
// same order, or existing names would get different avatars. Hue and background only pick colours.

export const DARK_BG = '#0d1117';

interface BuildContext {
  seed: string;
  /** Hue override, or null for the name's own hue. */
  hue: number | null;
  mode: BackgroundMode;
}

type Builder = (ctx: BuildContext) => AvatarModel;

function pickHue(ctx: BuildContext, own: number): number {
  return ctx.hue === null ? own : ctx.hue;
}

function isDark(ctx: BuildContext): boolean {
  return ctx.mode === 'dark';
}

function background(ctx: BuildContext, light: string, dark: string): string | null {
  if (ctx.mode === 'transparent') return null;
  return ctx.mode === 'dark' ? dark : light;
}

function cellsOf(grid: Grid, color: string, kind: CellKind = 'body', ox = 0, oy = 0): AvatarCell[] {
  const out: AvatarCell[] = [];
  forEachCell(grid, (x, y) => out.push({ x: x + ox, y: y + oy, height: 1, color, kind }));
  return out;
}

function model(
  ctx: BuildContext,
  style: StyleId,
  size: number,
  padding: number,
  bg: string | null,
  cells: AvatarCell[],
): AvatarModel {
  return { style, seed: ctx.seed, width: size, height: size, padding, background: bg, cells };
}

interface Base5 {
  hue: number;
  sat: number;
  light: number;
  grid: Grid;
}

/** Shared by every 5x5 style, so one name keeps its pattern and hue across styles. */
function base5(ctx: BuildContext): Base5 {
  const r = makeRng(ctx.seed, 'g5');
  const hue = pickHue(ctx, Math.floor(r() * 360));
  const sat = 48 + Math.floor(r() * 22);
  const light = 46 + Math.floor(r() * 10);
  return { hue, sat, light, grid: mirror(5, 5, r, 0.5) };
}

const classic: Builder = (ctx) => {
  const b = base5(ctx);
  const fill = isDark(ctx) ? hsl(b.hue, 75, 64) : hsl(b.hue, b.sat, b.light);
  return model(ctx, 'classic', 5, 1, background(ctx, '#f0f0f0', DARK_BG), cellsOf(b.grid, fill));
};

const duotone: Builder = (ctx) => {
  const b = base5(ctx);
  const pick = mirror(5, 5, makeRng(ctx.seed, 'duo'), 0.5);
  const dark = isDark(ctx);
  const a = hsl(b.hue, 70, dark ? 62 : 50);
  const c = hsl(b.hue + 160, 70, dark ? 66 : 55);
  const cells: AvatarCell[] = [];
  forEachCell(b.grid, (x, y) => {
    const first = pick[y][x];
    cells.push({ x, y, height: 1, color: first ? a : c, kind: first ? 'body' : 'second' });
  });
  return model(ctx, 'duotone', 5, 1, background(ctx, hsl(b.hue, 40, 94), DARK_BG), cells);
};

// Sticker outline and shadow sizes, in cells (the prototype used 0.14 u and 1.1% of the image).
const STICKER_OFFSET = 0.14;
const STICKER_GROW = 0.077;

const sticker: Builder = (ctx) => {
  const b = base5(ctx);
  const dark = isDark(ctx);
  const ink = dark ? hsl(b.hue, 40, 86) : hsl(b.hue, 55, 16);
  const fill = dark ? hsl(b.hue, b.sat + 10, 62) : hsl(b.hue, b.sat + 10, b.light + 2);
  const cells: AvatarCell[] = [];
  forEachCell(b.grid, (x, y) =>
    cells.push({ x, y, height: 0, color: ink, kind: 'shadow', dx: STICKER_OFFSET, dy: STICKER_OFFSET, grow: STICKER_GROW }),
  );
  forEachCell(b.grid, (x, y) => cells.push({ x, y, height: 0, color: ink, kind: 'outline', grow: STICKER_GROW }));
  cells.push(...cellsOf(b.grid, fill));
  return model(ctx, 'sticker', 5, 1, background(ctx, hsl(b.hue, 70, 91), DARK_BG), cells);
};

const invader: Builder = (ctx) => {
  const r = makeRng(ctx.seed, 'inv');
  const hue = pickHue(ctx, Math.floor(r() * 360));
  const g = mirror(8, 8, r, 0.55);
  // The prototype drew Invader on dark only; the dark palette keeps those colours.
  const fill = isDark(ctx) ? hsl(hue, 80, 62) : hsl(hue, 70, 48);
  return model(ctx, 'invader', 8, 1, background(ctx, hsl(hue, 30, 94), '#0f131a'), cellsOf(g, fill));
};

const CRITTER_MOUTHS: Array<Array<[number, number]>> = [
  [[4, 5]],
  [[3, 5], [4, 5], [5, 5]],
  [[3, 5], [5, 5], [4, 6]],
];
const CRITTER_EYES = [3, 5];
const CRITTER_EYE_ROW = 3;

const critter: Builder = (ctx) => {
  const r = makeRng(ctx.seed, 'crit');
  const hue = pickHue(ctx, Math.floor(r() * 360));
  const w = 9;
  const h = 9;
  const g = emptyGrid(w, h);
  const set = (x: number, y: number, v: boolean) => {
    g[y][x] = v;
    g[y][w - 1 - x] = v;
  };
  for (let y = 2; y <= 6; y++) {
    for (let x = 2; x <= 4; x++) set(x, y, true);
  }
  const ears = r() < 0.55;
  set(2, 1, ears);
  set(1, 1, ears && r() < 0.5);
  set(4, 1, r() < 0.4);
  for (let y = 3; y <= 6; y++) {
    set(1, y, r() < 0.5);
    set(0, y, g[y][1] && r() < 0.4);
  }
  let legs = 0;
  for (let x = 2; x <= 4; x++) {
    const leg = r() < 0.75;
    set(x, 7, leg);
    if (leg) legs++;
  }
  if (!legs) set(3, 7, true);
  set(1, 7, r() < 0.35);
  for (let x = 1; x <= 4; x++) set(x, 8, g[7][x] && r() < 0.6);

  const look = r() < 0.5 ? 0 : 1;
  const mouth = CRITTER_MOUTHS[Math.floor(r() * 3)];

  const dark = isDark(ctx);
  const body = hsl(hue, 62, dark ? 62 : 56);
  const pupil = hsl(hue, 50, 14);
  const mouthColor = hsl(hue, 50, 18);

  const face = new Map<string, CellKind>();
  for (const ex of CRITTER_EYES) face.set(ex + ',' + CRITTER_EYE_ROW, 'eye');
  for (const [mx, my] of mouth) face.set(mx + ',' + my, 'mouth');

  // One cell per grid position: eyes and mouth replace the body cell under them.
  const cells: AvatarCell[] = [];
  forEachCell(g, (x, y) => {
    if (!face.has(x + ',' + y)) cells.push({ x, y, height: 1, color: body, kind: 'body' });
  });
  for (const ex of CRITTER_EYES) cells.push({ x: ex, y: CRITTER_EYE_ROW, height: 1, color: '#ffffff', kind: 'eye' });
  for (const [mx, my] of mouth) cells.push({ x: mx, y: my, height: 1, color: mouthColor, kind: 'mouth' });
  for (const ex of CRITTER_EYES) {
    cells.push({ x: ex + look * 0.5, y: CRITTER_EYE_ROW + 0.25, w: 0.5, h: 0.5, height: 1, color: pupil, kind: 'pupil' });
  }
  return model(ctx, 'critter', 9, 1, background(ctx, hsl(hue, 40, 92), DARK_BG), cells);
};

const QUILT_KINDS: CellKind[] = ['tone-dark', 'tone-mid', 'tone-light'];

const quilt: Builder = (ctx) => {
  const b = base5(ctx);
  const r = makeRng(ctx.seed, 'quilt');
  // Quilt fills the whole square, so Dark shifts the tones down instead of changing a background.
  const tones = isDark(ctx) ? [22, 38, 56] : [34, 52, 70];
  const pick: number[][] = [];
  for (let y = 0; y < 5; y++) {
    const row = new Array<number>(5).fill(0);
    for (let x = 0; x < 3; x++) {
      const t = Math.floor(r() * 3);
      row[x] = t;
      row[4 - x] = t;
    }
    pick.push(row);
  }
  const cells: AvatarCell[] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const t = pick[y][x];
      cells.push({ x, y, height: 1, color: hsl(b.hue, b.sat + 5, tones[t]), kind: QUILT_KINDS[t] });
    }
  }
  const under = hsl(b.hue, b.sat + 5, tones[1]);
  return model(ctx, 'quilt', 5, 0, background(ctx, under, under), cells);
};

const dither: Builder = (ctx) => {
  const b = base5(ctx);
  const r = makeRng(ctx.seed, 'dit');
  const n = 12;
  const g = emptyGrid(n, n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n / 2; x++) {
      const dist = Math.hypot(x + 0.5 - n / 2, y + 0.5 - n / 2) / 7.2;
      const p = 1.05 - Math.pow(dist, 1.6) * 1.25;
      const v = r() < p;
      g[y][x] = v;
      g[y][n - 1 - x] = v;
    }
  }
  ensure(g);
  const fill = isDark(ctx) ? hsl(b.hue, 62, 62) : hsl(b.hue, 62, 42);
  return model(ctx, 'dither', 12, 1, background(ctx, hsl(b.hue, 35, 93), DARK_BG), cellsOf(g, fill));
};

const aurora: Builder = (ctx) => {
  const b = base5(ctx);
  const dark = isDark(ctx);
  const cells: AvatarCell[] = [];
  forEachCell(b.grid, (x, y) => {
    const h = b.hue + y * 26 + x * 6;
    cells.push({ x, y, height: 1, color: dark ? hsl(h, 85, 62) : hsl(h, 72, 48), kind: 'body' });
  });
  // The prototype drew Aurora on dark only; the dark palette keeps those colours.
  return model(ctx, 'aurora', 5, 1, background(ctx, hsl(b.hue, 25, 95), '#10131b'), cells);
};

const kaleido: Builder = (ctx) => {
  const b = base5(ctx);
  const r = makeRng(ctx.seed, 'kal');
  const q: number[][] = [];
  for (let y = 0; y < 3; y++) {
    const row: number[] = [];
    for (let x = 0; x < 3; x++) {
      const v = r();
      row.push(v < 0.3 ? 0 : v < 0.7 ? 1 : 2);
    }
    q.push(row);
  }
  if (!q[2][2]) q[2][2] = 1;
  const dark = isDark(ctx);
  const colors = ['', hsl(b.hue, 65, dark ? 60 : 48), hsl(b.hue + 40, 75, dark ? 66 : 60)];
  const cells: AvatarCell[] = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const v = q[y][x];
      if (!v) continue;
      const color = colors[v];
      const kind: CellKind = v === 1 ? 'body' : 'second';
      for (const [cx, cy] of [[x, y], [5 - x, y], [x, 5 - y], [5 - x, 5 - y]]) {
        cells.push({ x: cx, y: cy, height: 1, color, kind });
      }
    }
  }
  return model(ctx, 'kaleido', 6, 1, background(ctx, hsl(b.hue, 30, 93), DARK_BG), cells);
};

const frame: Builder = (ctx) => {
  const b = base5(ctx);
  const dark = isDark(ctx);
  const ring = dark ? hsl(b.hue, 30, 34) : hsl(b.hue, 45, 72);
  const inner = dark ? hsl(b.hue, b.sat + 15, 63) : hsl(b.hue, b.sat, b.light);
  const cells: AvatarCell[] = [];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const onRing = x === 0 || x === 6 || y === 0 || y === 6;
      if (onRing && (x + y) % 2 === 0) cells.push({ x, y, height: 1, color: ring, kind: 'edge' });
    }
  }
  cells.push(...cellsOf(b.grid, inner, 'body', 1, 1));
  return model(ctx, 'frame', 7, 1, background(ctx, hsl(b.hue, 30, 95), DARK_BG), cells);
};

export const BUILDERS: Record<StyleId, Builder> = {
  classic,
  duotone,
  sticker,
  invader,
  critter,
  quilt,
  dither,
  aurora,
  kaleido,
  frame,
};

export type { BuildContext };
