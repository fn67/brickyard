import { describe, expect, it } from 'vitest';
import { generateAvatar, STYLE_IDS, type AvatarModel } from '../src/engine';

export const SAMPLE_NAMES = [
  'hello-world',
  '',
  'a',
  'x'.repeat(40),
  'quiet-fork',
  'octocat',
  'José Martí',
  'Ünïcødé ñame',
  '山田太郎',
  'مرحبا',
  '😀 emoji 🚀',
  'hello-world:3',
  '   spaced   ',
];

function validate(m: AvatarModel): void {
  expect(m.width).toBeGreaterThan(0);
  expect(m.height).toBe(m.width);
  expect(m.padding).toBeGreaterThanOrEqual(0);
  expect(m.cells.length).toBeGreaterThan(0);
  for (const c of m.cells) {
    expect(Number.isFinite(c.x)).toBe(true);
    expect(Number.isFinite(c.y)).toBe(true);
    expect(c.x).toBeGreaterThanOrEqual(0);
    expect(c.y).toBeGreaterThanOrEqual(0);
    expect(c.x + (c.w ?? 1)).toBeLessThanOrEqual(m.width);
    expect(c.y + (c.h ?? 1)).toBeLessThanOrEqual(m.height);
    expect(c.height).toBeGreaterThanOrEqual(0);
    expect(typeof c.color).toBe('string');
    expect(c.color.length).toBeGreaterThan(0);
  }
}

describe('generateAvatar', () => {
  it('gives identical output for identical input', () => {
    for (const style of STYLE_IDS) {
      for (const name of SAMPLE_NAMES) {
        const a = generateAvatar(name, { style });
        const b = generateAvatar(name, { style });
        expect(a).toEqual(b);
      }
    }
  });

  it('produces a valid model for every style and sample name', () => {
    for (const style of STYLE_IDS) {
      for (const name of SAMPLE_NAMES) validate(generateAvatar(name, { style }));
    }
  });

  it('defaults to the Light background and the Auto hue', () => {
    const a = generateAvatar('hello-world', { style: 'classic' });
    const b = generateAvatar('hello-world', { style: 'classic', hue: null, background: 'light' });
    expect(a).toEqual(b);
  });

  it('has the expected grid size per style', () => {
    const sizes: Record<string, number> = {
      classic: 5, duotone: 5, sticker: 5, invader: 8, critter: 9,
      quilt: 5, dither: 12, aurora: 5, kaleido: 6, frame: 7,
    };
    for (const style of STYLE_IDS) expect(generateAvatar('x', { style }).width).toBe(sizes[style]);
  });

  it('gives different names different patterns', () => {
    const a = generateAvatar('hello-world', { style: 'classic' });
    const b = generateAvatar('quiet-fork', { style: 'classic' });
    expect(a.cells).not.toEqual(b.cells);
  });

  it('shares the 5x5 pattern across Classic, Duotone, Sticker, Aurora and the inside of Frame', () => {
    for (const name of SAMPLE_NAMES) {
      const key = (m: AvatarModel, off = 0) =>
        m.cells.filter((c) => c.kind !== 'edge' && c.kind !== 'shadow' && c.kind !== 'outline')
          .map((c) => c.x - off + ',' + (c.y - off)).sort().join(' ');
      const classic = key(generateAvatar(name, { style: 'classic' }));
      expect(key(generateAvatar(name, { style: 'duotone' }))).toBe(classic);
      expect(key(generateAvatar(name, { style: 'sticker' }))).toBe(classic);
      expect(key(generateAvatar(name, { style: 'aurora' }))).toBe(classic);
      expect(key(generateAvatar(name, { style: 'frame' }), 1)).toBe(classic);
    }
  });

  it('only offers 3D data for Critter faces: eyes, mouth and pupils', () => {
    const m = generateAvatar('hello-world', { style: 'critter' });
    expect(m.cells.filter((c) => c.kind === 'eye')).toHaveLength(2);
    expect(m.cells.filter((c) => c.kind === 'pupil')).toHaveLength(2);
    expect(m.cells.filter((c) => c.kind === 'mouth').length).toBeGreaterThan(0);
  });
});
