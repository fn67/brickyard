import { describe, expect, it } from 'vitest';
import { generateAvatar, STYLES, type BackgroundMode, type StyleId } from '../src/engine';
import { drawAvatar } from '../src/render/canvas';
import { loadPrototype } from './prototype';
import { Raster } from './raster';

// Draws each name with the original prototype and with the new engine plus canvas renderer, and
// compares every pixel. Sizes are chosen so one cell is a whole number of pixels.

const NAMES = ['hello-world', 'quiet-fork', 'octocat', 'José', '山田太郎', '', 'x'.repeat(40), 'sleepy-rebase:4'];

// Invader and Aurora were dark-only in the prototype, so their prototype look is the Dark background.
const PROTOTYPE_MODE: Partial<Record<StyleId, BackgroundMode>> = { invader: 'dark', aurora: 'dark' };

const UNITS: Record<StyleId, number> = {
  classic: 7, duotone: 7, sticker: 7, invader: 10, critter: 11, quilt: 5, dither: 14, aurora: 7, kaleido: 8, frame: 9,
};

const proto = loadPrototype();

function compare(style: StyleId, name: string, hue: number | null): void {
  const size = UNITS[style] * 40;
  const p = proto.styles.find((s) => s.id === style);
  if (!p) throw new Error('Prototype has no style ' + style);
  proto.setHue(hue);
  const expected = new Raster(size);
  p.draw(expected, size, name || 'hello-world');
  const actual = new Raster(size);
  const model = generateAvatar(name || 'hello-world', { style, hue, background: PROTOTYPE_MODE[style] ?? 'light' });
  drawAvatar(actual, model, size);
  expect(new Set(expected.px).size, 'prototype drew something').toBeGreaterThan(1);
  let diff = 0;
  for (let i = 0; i < expected.px.length; i++) if (expected.px[i] !== actual.px[i]) diff++;
  expect(diff, `${style} "${name}" hue ${hue}: ${diff} pixels differ`).toBe(0);
}

describe('parity with reference/prototype.html', () => {
  it('has all ten styles in the prototype', () => {
    for (const s of STYLES) expect(proto.styles.some((p) => p.id === s.id)).toBe(true);
  });

  for (const s of STYLES) {
    it(`draws ${s.name} pixel for pixel like the prototype`, () => {
      for (const name of NAMES) compare(s.id, name, null);
    });
    it(`draws ${s.name} like the prototype with a hue override`, () => {
      for (const name of NAMES.slice(0, 5)) for (const hue of [0, 215, 320]) compare(s.id, name, hue);
    });
  }
});
