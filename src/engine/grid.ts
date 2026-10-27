import type { Rng } from './random';

export type Grid = boolean[][];

export function emptyGrid(w: number, h: number): Grid {
  const g: Grid = [];
  for (let y = 0; y < h; y++) g.push(new Array<boolean>(w).fill(false));
  return g;
}

export function forEachCell(grid: Grid, fn: (x: number, y: number) => void): void {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x]) fn(x, y);
    }
  }
}

/** Keeps a sparse pattern from looking empty by filling the centre column(s). */
export function ensure(g: Grid): Grid {
  const h = g.length;
  const w = g[0].length;
  let n = 0;
  forEachCell(g, () => n++);
  if (n < Math.ceil(w * h * 0.28)) {
    const cols = w % 2 ? [(w - 1) / 2] : [w / 2 - 1, w / 2];
    for (let y = 0; y < h; y++) {
      for (const c of cols) g[y][c] = true;
    }
  }
  return g;
}

/** Left half is random, right half mirrors it. */
export function mirror(w: number, h: number, r: Rng, density: number): Grid {
  const g: Grid = [];
  const half = Math.ceil(w / 2);
  for (let y = 0; y < h; y++) {
    const row = new Array<boolean>(w).fill(false);
    for (let x = 0; x < half; x++) {
      const v = r() < density;
      row[x] = v;
      row[w - 1 - x] = v;
    }
    g.push(row);
  }
  return ensure(g);
}
