import type { AvatarCell, StyleId } from './types';

/**
 * 3D height rules, one per style that has a 3D view. A rule sets each cell's `height` (extrusion)
 * and `z` (base elevation). Adding 3D to another style later means adding a rule here; the
 * renderers need no changes. Cells with height 0 are 2D-only decoration.
 */
export type HeightRule = (cell: AvatarCell) => Pick<AvatarCell, 'height' | 'z'>;

/** How far Critter's eyes and mouth stand out from the body. */
export const CRITTER_FACE_RAISE = 0.25;
/** Thickness of the pupil block that sits on top of each eye. */
export const CRITTER_PUPIL_DEPTH = 0.2;

const critter: HeightRule = (cell) => {
  switch (cell.kind) {
    case 'eye':
    case 'mouth':
      return { height: 1 + CRITTER_FACE_RAISE, z: 0 };
    case 'pupil':
      return { height: CRITTER_PUPIL_DEPTH, z: 1 + CRITTER_FACE_RAISE };
    default:
      return { height: 1, z: 0 };
  }
};

export const HEIGHT_RULES: Partial<Record<StyleId, HeightRule>> = { critter };

export function applyHeights(style: StyleId, cells: AvatarCell[]): AvatarCell[] {
  const rule = HEIGHT_RULES[style];
  return rule ? cells.map((c) => ({ ...c, ...rule(c) })) : cells;
}
