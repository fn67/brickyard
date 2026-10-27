import { useEffect, useState } from 'react';

/**
 * The height of the part of the page that is visible, which shrinks when the on-screen keyboard
 * opens. The phone editor sizes itself to it so the page never scrolls.
 */
export function useViewportHeight(): number | null {
  const [h, setH] = useState<number | null>(() => window.visualViewport?.height ?? null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setH(vv.height);
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);
  return h;
}
