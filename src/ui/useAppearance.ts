import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark';

const STORAGE_KEY = 'brickyard-appearance';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function savedAppearance(): Appearance | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function systemAppearance(): Appearance {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/**
 * The app's light or dark appearance. Follows the system until the person taps the toggle, then
 * remembers their choice. index.html applies a saved choice before first paint.
 */
export function useAppearance(): { appearance: Appearance; toggle: () => void } {
  const [saved, setSaved] = useState<Appearance | null>(savedAppearance);
  const [system, setSystem] = useState<Appearance>(systemAppearance);

  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const appearance = saved ?? system;

  const toggle = useCallback(() => {
    const next: Appearance = appearance === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the toggle still works for this visit.
    }
    setSaved(next);
  }, [appearance]);

  return { appearance, toggle };
}
