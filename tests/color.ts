// Colour helpers for tests: parse the engine's colour strings and measure contrast.

export function parseColor(c: string): [number, number, number] {
  const hex = /^#([0-9a-f]{6})$/i.exec(c);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = /^hsl\((-?[\d.]+),([\d.]+)%,([\d.]+)%\)$/.exec(c);
  if (!m) throw new Error('Unknown colour ' + c);
  const h = Number(m[1]) / 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255)) as [number, number, number];
}

export function lightness(c: string): number {
  const m = /^hsl\([^,]+,[^,]+,([\d.]+)%\)$/.exec(c);
  if (!m) throw new Error('Not an hsl colour ' + c);
  return Number(m[1]);
}

export function hueOf(c: string): number {
  const m = /^hsl\((-?[\d.]+),/.exec(c);
  if (!m) throw new Error('Not an hsl colour ' + c);
  return Number(m[1]);
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(parseColor(a));
  const lb = luminance(parseColor(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
