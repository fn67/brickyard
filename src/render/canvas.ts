import type { AvatarCell, AvatarModel } from '../engine';

/** The part of CanvasRenderingContext2D the flat renderer uses, so tests can pass a fake. */
export interface FlatContext {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
}

// Edges are rounded so neighbouring cells never leave hairline gaps.
function drawCell(ctx: FlatContext, cell: AvatarCell, u: number, ox: number, oy: number): void {
  const ux = ox + Math.round((cell.dx ?? 0) * u);
  const uy = oy + Math.round((cell.dy ?? 0) * u);
  const g = cell.grow ? Math.max(2, Math.round(cell.grow * u)) : 0;
  if (cell.w !== undefined || cell.h !== undefined) {
    // Sub-cell blocks (pupils) keep their own size instead of snapping to the grid.
    ctx.fillRect(
      Math.round(ux + cell.x * u),
      Math.round(uy + cell.y * u),
      Math.round((cell.w ?? 1) * u),
      Math.round((cell.h ?? 1) * u),
    );
    return;
  }
  const x0 = Math.round(ux + cell.x * u) - g;
  const y0 = Math.round(uy + cell.y * u) - g;
  const x1 = Math.round(ux + (cell.x + 1) * u) + g;
  const y1 = Math.round(uy + (cell.y + 1) * u) + g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}

/** Draws the model flat into a square of side `size` pixels at the context origin. */
export function drawAvatar(ctx: FlatContext, model: AvatarModel, size: number): void {
  ctx.clearRect(0, 0, size, size);
  if (model.background) {
    ctx.fillStyle = model.background;
    ctx.fillRect(0, 0, size, size);
  }
  const u = size / (model.width + model.padding * 2);
  const o = model.padding * u;
  for (const cell of model.cells) {
    ctx.fillStyle = cell.color;
    drawCell(ctx, cell, u, o, o);
  }
}
