import { describe, expect, it } from 'vitest';
import { ABOUT } from '../src/content/about';
import { ensure } from '../src/engine/grid';

const allText = JSON.stringify(ABOUT);

/** Every distinct 5×5 shape: each of the 2^15 left halves, mirrored, then the engine's ensure() rule. */
function distinct5x5Shapes(): number {
  const seen = new Set<string>();
  for (let bits = 0; bits < 1 << 15; bits++) {
    const g: boolean[][] = [];
    for (let y = 0; y < 5; y++) {
      const [a, b, c] = [0, 1, 2].map((i) => ((bits >> (y * 3 + i)) & 1) === 1);
      g.push([a, b, c, b, a]);
    }
    seen.add(ensure(g).map((row) => row.map(Number).join('')).join('/'));
  }
  return seen.size;
}

describe('About content', () => {
  it('has the sections in the designed order', () => {
    expect(ABOUT.sections.map((s) => s.heading)).toEqual([
      'Same name, same face',
      'What you can do',
      'How it works',
      'Why each style looks different',
      'Variations',
      'How unique is it?',
      'Why blocks?',
    ]);
    expect(ABOUT.sections[2].steps?.map((s) => s.lead)).toEqual(['Hash.', 'Seeded random numbers.', 'Fill half the grid.', 'Colour.']);
  });

  it('makes no privacy claims (the "Private by design" section was removed on purpose)', () => {
    expect(allText).not.toMatch(/privacy|private|upload|not stored|never stored|server/i);
  });

  it('states the number of 5×5 shapes the engine can really make', () => {
    const n = distinct5x5Shapes();
    expect(n).toBe(30537);
    const rounded = (Math.round(n / 500) * 500).toLocaleString('en-US');
    expect(allText).toContain('about ' + rounded + ' possible shapes');
  });
});
