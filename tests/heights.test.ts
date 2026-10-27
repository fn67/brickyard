import { describe, expect, it } from 'vitest';
import { CRITTER_PUPIL_DEPTH, generateAvatar, HEIGHT_RULES, STYLES } from '../src/engine';
import { SAMPLE_NAMES } from './engine.test';

describe('3D height rules', () => {
  it('exist exactly for the styles that offer 3D', () => {
    for (const s of STYLES) expect(!!HEIGHT_RULES[s.id], s.id).toBe(s.has3d);
    expect(STYLES.filter((s) => s.has3d).map((s) => s.id)).toEqual(['critter']);
  });

  it('Critter: body 1 unit, eyes and mouth raised by 0.25, pupils sit on top of the eyes', () => {
    for (const name of SAMPLE_NAMES) {
      const m = generateAvatar(name, { style: 'critter' });
      for (const c of m.cells) {
        if (c.kind === 'body') expect([c.height, c.z ?? 0]).toEqual([1, 0]);
        if (c.kind === 'eye' || c.kind === 'mouth') expect([c.height, c.z ?? 0]).toEqual([1.25, 0]);
      }
      const eyes = m.cells.filter((c) => c.kind === 'eye');
      const pupils = m.cells.filter((c) => c.kind === 'pupil');
      expect(pupils).toHaveLength(2);
      pupils.forEach((p, i) => {
        const eye = eyes[i];
        expect(p.z).toBe(eye.height);
        expect(p.height).toBe(CRITTER_PUPIL_DEPTH);
        expect(p.w).toBeLessThan(1);
        // The pupil lies within its eye's footprint.
        expect(p.x).toBeGreaterThanOrEqual(eye.x);
        expect(p.x + (p.w ?? 1)).toBeLessThanOrEqual(eye.x + 1);
        expect(p.y).toBeGreaterThanOrEqual(eye.y);
        expect(p.y + (p.h ?? 1)).toBeLessThanOrEqual(eye.y + 1);
        expect(p.color).not.toBe(eye.color);
      });
    }
  });

  it('keeps one cell per grid position for Critter (no overlapping boxes)', () => {
    const m = generateAvatar('hello-world', { style: 'critter' });
    const keys = m.cells.filter((c) => c.kind !== 'pupil').map((c) => c.x + ',' + c.y);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('heights never change with hue or background', () => {
    const ref = generateAvatar('hello-world', { style: 'critter' }).cells.map((c) => [c.height, c.z]);
    for (const background of ['light', 'dark', 'transparent'] as const) {
      expect(generateAvatar('hello-world', { style: 'critter', background, hue: 250 }).cells.map((c) => [c.height, c.z])).toEqual(ref);
    }
  });
});
