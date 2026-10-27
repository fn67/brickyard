/**
 * "Try it" disappears once Critter is selected, so focus moves to the 3D view (or the 3D switch
 * while the view loads) instead of falling back to the page.
 */
export function tryCritterAndFocus(tryCritter: () => void): void {
  tryCritter();
  let tries = 0;
  const focus = () => {
    const scene = document.querySelector<HTMLElement>('.scene3d[tabindex]');
    if (scene) return scene.focus();
    if (++tries < 40) return void setTimeout(focus, 50);
    document.querySelector<HTMLElement>('.mode-switch [aria-pressed="true"]')?.focus();
  };
  setTimeout(focus, 0);
}
