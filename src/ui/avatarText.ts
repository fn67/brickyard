import { styleInfo, type StyleId } from '../engine';

/** Text alternative for an avatar image, for example "Avatar for hello-world in the Classic style". */
export function avatarAlt(name: string, style: StyleId): string {
  return 'Avatar for ' + name + ' in the ' + styleInfo(style).name + ' style';
}
