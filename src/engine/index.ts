export * from './types';
export { generateAvatar } from './generate';
export { hashString, makeRng, hsl } from './random';
export { STYLES, STYLE_IDS, HUES, styleInfo, type StyleInfo } from './catalog';
export {
  DEFAULT_NAME,
  MAX_NAME_LENGTH,
  VARIATION_COUNT,
  effectiveName,
  shuffleName,
  baseName,
  variationNumber,
  variationNames,
} from './names';
export { HEIGHT_RULES, CRITTER_FACE_RAISE, CRITTER_PUPIL_DEPTH, type HeightRule } from './heights';
