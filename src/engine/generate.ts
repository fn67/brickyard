import { BUILDERS } from './styles';
import type { AvatarModel, AvatarOptions } from './types';

/**
 * Turns a name into avatar data. Pure and deterministic: the same seed and options always give
 * the same model. Hue and background change colours only, never which cells are filled.
 */
export function generateAvatar(seed: string, options: AvatarOptions): AvatarModel {
  const build = BUILDERS[options.style];
  return build({ seed, hue: options.hue ?? null, mode: options.background ?? 'light' });
}
