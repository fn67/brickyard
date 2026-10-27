import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Loads the draw functions from the original prototype so tests can compare against them.

export interface PrototypeStyle {
  id: string;
  draw: (ctx: unknown, size: number, seed: string) => void;
}

export interface Prototype {
  styles: PrototypeStyle[];
  setHue(hue: number | null): void;
}

export function loadPrototype(): Prototype {
  const path = fileURLToPath(new URL('../reference/prototype.html', import.meta.url));
  const html = readFileSync(path, 'utf8');
  const start = html.indexOf("var DEFAULT_SEED");
  const end = html.indexOf('var ADJ');
  if (start < 0 || end < 0) throw new Error('Could not find the prototype engine code');
  const src = html.slice(start, end);
  const factory = new Function(
    'var state = { hue: null };\n' + src + '\nreturn { styles: STYLES, setHue: function (h) { state.hue = h; } };',
  );
  return factory() as Prototype;
}
