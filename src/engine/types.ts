export type StyleId =
  | 'classic'
  | 'duotone'
  | 'sticker'
  | 'invader'
  | 'critter'
  | 'quilt'
  | 'dither'
  | 'aurora'
  | 'kaleido'
  | 'frame';

export type BackgroundMode = 'light' | 'dark' | 'transparent';

/** What a cell is for. Renderers and future height rules can key off it. */
export type CellKind =
  | 'body'
  | 'second'
  | 'edge'
  | 'shadow'
  | 'outline'
  | 'eye'
  | 'pupil'
  | 'mouth'
  | 'tone-dark'
  | 'tone-mid'
  | 'tone-light';

export interface AvatarCell {
  /** Column, in grid units from the left edge of the grid. May be fractional (pupils). */
  x: number;
  /** Row, in grid units from the top edge of the grid. May be fractional (pupils). */
  y: number;
  /** Extrusion in 3D units. 0 means the cell is 2D decoration only. */
  height: number;
  /** CSS colour string. */
  color: string;
  kind?: CellKind;
  /** Footprint in grid units when not a whole cell (default 1). */
  w?: number;
  h?: number;
  /** Elevation of the cell's base in 3D units (default 0). */
  z?: number;
  /** 2D-only offset in grid units (Sticker shadow). */
  dx?: number;
  dy?: number;
  /** 2D-only growth on every side in grid units (Sticker outline). */
  grow?: number;
}

export interface AvatarModel {
  style: StyleId;
  seed: string;
  /** Grid size in cells. */
  width: number;
  height: number;
  /** Empty margin around the grid, in cells, used by flat renderers. */
  padding: number;
  /** Background colour, or null for transparent. */
  background: string | null;
  /** Cells in paint order. */
  cells: AvatarCell[];
}

export interface AvatarOptions {
  style: StyleId;
  /** Hue override in degrees, or null for Auto (the hue comes from the name). */
  hue?: number | null;
  background?: BackgroundMode;
}
