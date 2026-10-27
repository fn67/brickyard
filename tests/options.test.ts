import { describe, expect, it } from 'vitest';
import { generateAvatar, HUES, STYLE_IDS, type AvatarModel, type BackgroundMode } from '../src/engine';
import { contrast, hueOf, lightness } from './color';
import { SAMPLE_NAMES } from './engine.test';

const MODES: BackgroundMode[] = ['light', 'dark', 'transparent'];

/** Everything about the cells except their colour: which cells are filled, and their shape. */
function shape(m: AvatarModel) {
  return {
    width: m.width,
    height: m.height,
    padding: m.padding,
    cells: m.cells.map(({ color: _color, ...rest }) => rest),
  };
}

describe('Colour and Background', () => {
  it('never change which cells are filled', () => {
    for (const style of STYLE_IDS) {
      for (const name of SAMPLE_NAMES) {
        const ref = shape(generateAvatar(name, { style }));
        for (const background of MODES) {
          for (const hue of [null, ...HUES]) {
            expect(shape(generateAvatar(name, { style, hue, background })), `${style} ${name} ${background} ${hue}`).toEqual(ref);
          }
        }
      }
    }
  });

  it('Transparent returns no background, Light and Dark always return one', () => {
    for (const style of STYLE_IDS) {
      expect(generateAvatar('hello-world', { style, background: 'transparent' }).background).toBeNull();
      expect(generateAvatar('hello-world', { style, background: 'light' }).background).toBeTruthy();
      expect(generateAvatar('hello-world', { style, background: 'dark' }).background).toBeTruthy();
    }
  });

  it('Transparent keeps the Light cell colours', () => {
    for (const style of STYLE_IDS) {
      const light = generateAvatar('hello-world', { style, background: 'light' });
      const clear = generateAvatar('hello-world', { style, background: 'transparent' });
      expect(clear.cells).toEqual(light.cells);
    }
  });

  it('Dark uses a near-black background except for Quilt, which fills the square', () => {
    for (const style of STYLE_IDS) {
      if (style === 'quilt') continue;
      const bg = generateAvatar('hello-world', { style, background: 'dark' }).background!;
      expect(contrast(bg, '#000000'), style).toBeLessThan(1.25);
    }
  });

  it('Quilt shifts its tones darker in Dark', () => {
    const light = generateAvatar('hello-world', { style: 'quilt', background: 'light' });
    const dark = generateAvatar('hello-world', { style: 'quilt', background: 'dark' });
    dark.cells.forEach((c, i) => expect(lightness(c.color)).toBeLessThan(lightness(light.cells[i].color)));
  });

  it('keeps main cells in the designed lightness band', () => {
    for (const style of STYLE_IDS) {
      if (style === 'quilt') continue;
      for (const name of SAMPLE_NAMES) {
        for (const [mode, lo, hi] of [['light', 36, 57], ['dark', 60, 66]] as const) {
          const body = generateAvatar(name, { style, background: mode }).cells.filter((c) => c.kind === 'body');
          for (const c of body) {
            const l = lightness(c.color);
            expect(l, `${style} ${mode}`).toBeGreaterThanOrEqual(lo);
            expect(l, `${style} ${mode}`).toBeLessThanOrEqual(hi);
          }
        }
      }
    }
  });

  it('keeps every style readable on Light and Dark, including Invader and Aurora on Light', () => {
    for (const style of STYLE_IDS) {
      if (style === 'quilt') continue;
      for (const name of SAMPLE_NAMES) {
        for (const background of ['light', 'dark'] as const) {
          for (const hue of [null, ...HUES]) {
            const m = generateAvatar(name, { style, hue, background });
            // The prototype's own light palettes are kept for parity; yellows on them sit near 1.4:1.
            // Invader and Aurora had no light palette before, so theirs are held to a higher bar.
            const min = background === 'dark' ? 3 : style === 'invader' || style === 'aurora' ? 2.5 : 1.35;
            for (const c of m.cells.filter((c) => c.kind === 'body')) {
              expect(contrast(c.color, m.background!), `${style} ${background} hue ${hue}`).toBeGreaterThanOrEqual(min);
            }
          }
        }
      }
    }
  });

  it('a swatch overrides only the hue', () => {
    for (const style of STYLE_IDS) {
      const auto = generateAvatar('hello-world', { style });
      const blue = generateAvatar('hello-world', { style, hue: 215 });
      auto.cells.forEach((c, i) => {
        if (!c.color.startsWith('hsl')) return;
        const l = lightness(blue.cells[i].color);
        // Invader and Aurora darken yellows, greens and cyans on Light, inside the same band.
        if (style === 'invader' || style === 'aurora') expect(l).toBeGreaterThanOrEqual(36);
        else expect(l, style).toBe(lightness(c.color));
      });
    }
  });

  it('moves the second colour of Duotone and Kaleido with the chosen hue', () => {
    for (const [style, shift] of [['duotone', 160], ['kaleido', 40]] as const) {
      for (const hue of HUES) {
        const second = generateAvatar('hello-world', { style, hue }).cells.find((c) => c.kind === 'second');
        if (second) expect(hueOf(second.color)).toBe((hue + shift) % 360);
      }
    }
  });

  it('Auto returns to the name\'s own colour', () => {
    for (const style of STYLE_IDS) {
      expect(generateAvatar('hello-world', { style, hue: null })).toEqual(generateAvatar('hello-world', { style }));
      expect(generateAvatar('hello-world', { style, hue: null })).not.toEqual(generateAvatar('hello-world', { style, hue: 100 }));
    }
  });
});
