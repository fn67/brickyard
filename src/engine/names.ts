export const DEFAULT_NAME = 'hello-world';
export const MAX_NAME_LENGTH = 40;
export const VARIATION_COUNT = 6;

const ADJ = ['quiet', 'tiny', 'loud', 'lazy', 'brave', 'odd', 'sunny', 'cold', 'rusty', 'sleepy'];
const NOUN = ['fork', 'merge', 'branch', 'commit', 'stash', 'rebase', 'patch', 'diff', 'bug', 'repo'];

/** What the engine draws for a given field value: trimmed, or the default when empty. */
export function effectiveName(field: string): string {
  return field.trim() || DEFAULT_NAME;
}

/** A random two-word, git-flavoured name such as "quiet-fork". */
export function shuffleName(random: () => number = Math.random): string {
  const a = ADJ[Math.floor(random() * ADJ.length)];
  const n = NOUN[Math.floor(random() * NOUN.length)];
  return a + '-' + n;
}

/** The name without a trailing ":number" variation suffix. */
export function baseName(name: string): string {
  return name.replace(/:\d+$/, '');
}

/** The variation number of a name ("hello-world:3" gives 3), or 0 for the original. */
export function variationNumber(name: string): number {
  const m = /:(\d+)$/.exec(name);
  return m ? Number(m[1]) : 0;
}

/** The name itself, then the name with ":1", ":2" and so on. */
export function variationNames(name: string, count = VARIATION_COUNT): string[] {
  const base = baseName(name);
  return Array.from({ length: count }, (_, i) => (i === 0 ? base : base + ':' + i));
}
