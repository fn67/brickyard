import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from './color';

// Checks the app's text colours against the surfaces they sit on, in both app appearances.

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

function tokens(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2].toLowerCase();
  return out;
}

// The background icons (--bgicon-*) picture avatar backgrounds and stay the same in both appearances.
const switched = (t: Record<string, string>) => Object.keys(t).filter((k) => !k.startsWith('bgicon-')).sort();

const light = tokens(css.slice(css.indexOf(':root {'), css.indexOf('@media')));
const dark = tokens(css.slice(css.indexOf(":root[data-theme='dark']")));

// [text, background, minimum]: 4.5 for text, 3 for large text, focus rings and control borders.
const PAIRS: Array<[string, string, number]> = [
  ['ink', 'bg', 4.5], ['ink', 'surface', 4.5], ['ink', 'sunken', 4.5],
  ['ink2', 'bg', 4.5], ['ink2', 'surface', 4.5], ['ink2', 'sunken', 4.5],
  ['ink3', 'bg', 4.5], ['ink3', 'surface', 4.5], ['ink3', 'sunken', 4.5],
  ['accent', 'surface', 4.5], ['accent', 'bg', 4.5], ['accent', 'sunken', 4.5],
  ['onaccent', 'accent', 4.5],
  ['danger', 'sunken', 3], ['danger', 'surface', 3],
  ['bg', 'ink', 4.5], // the 3D badge: --bg text on --ink
];

describe('app colour contrast', () => {
  for (const [name, t] of [['light', light], ['dark', dark]] as const) {
    it(`meets contrast minimums in the ${name} appearance`, () => {
      for (const [fg, bg, min] of PAIRS) {
        expect(t[fg], fg).toBeTruthy();
        expect(contrast(t[fg], t[bg]), `${name}: ${fg} on ${bg}`).toBeGreaterThanOrEqual(min);
      }
    });
  }

  it('defines the same tokens for both appearances', () => {
    expect(switched(dark)).toEqual(switched(light));
  });
});
