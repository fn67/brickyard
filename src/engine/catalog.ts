import type { StyleId } from './types';

export interface StyleInfo {
  id: StyleId;
  name: string;
  /** Grid size label, for example "5×5". */
  grid: string;
  /** Short note, for example "Two hues". */
  note: string;
  /** True when the style has a 3D view in this version. */
  has3d: boolean;
}

export const STYLES: readonly StyleInfo[] = [
  { id: 'classic', name: 'Classic', grid: '5×5', note: 'Light', has3d: false },
  { id: 'duotone', name: 'Duotone', grid: '5×5', note: 'Two hues', has3d: false },
  { id: 'sticker', name: 'Sticker', grid: '5×5', note: 'Outlined', has3d: false },
  { id: 'invader', name: 'Invader', grid: '8×8', note: 'Arcade', has3d: false },
  { id: 'critter', name: 'Critter', grid: '9×9', note: 'With a face', has3d: true },
  { id: 'quilt', name: 'Quilt', grid: '5×5', note: 'Tonal', has3d: false },
  { id: 'dither', name: 'Dither', grid: '12×12', note: 'Blob', has3d: false },
  { id: 'aurora', name: 'Aurora', grid: '5×5', note: 'Hue sweep', has3d: false },
  { id: 'kaleido', name: 'Kaleido', grid: '6×6', note: 'Four-way symmetry', has3d: false },
  { id: 'frame', name: 'Frame', grid: '7×7', note: 'Stitched edge', has3d: false },
];

export const STYLE_IDS: readonly StyleId[] = STYLES.map((s) => s.id);

export function styleInfo(id: StyleId): StyleInfo {
  return STYLES.find((s) => s.id === id) ?? STYLES[0];
}

/** Hues offered by the Colour control, in degrees. */
export const HUES: readonly number[] = [0, 28, 48, 100, 160, 190, 215, 250, 285, 320];
