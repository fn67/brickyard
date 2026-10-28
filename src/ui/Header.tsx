import type { Ref } from 'react';
import { InfoIcon, LogoMark, MoonIcon, SunIcon } from './icons';
import type { Appearance } from './useAppearance';

interface Props {
  appearance: Appearance;
  onToggleAppearance: () => void;
  onAbout: () => void;
  /** The "i" button, so focus can return to it when About closes. */
  aboutRef: Ref<HTMLButtonElement>;
  compact?: boolean;
}

export const ABOUT_LABEL = 'About Brickyard';

export function Header({ appearance, onToggleAppearance, onAbout, aboutRef, compact }: Props) {
  const label = appearance === 'dark' ? 'Switch app to light mode' : 'Switch app to dark mode';
  const buttons = (
    <>
      <button
        ref={aboutRef}
        type="button"
        className="btn icon-btn plain-icon-btn about-btn"
        aria-label={ABOUT_LABEL}
        title={ABOUT_LABEL}
        aria-haspopup="dialog"
        onClick={onAbout}
      >
        <InfoIcon />
      </button>
      <button type="button" className="btn icon-btn plain-icon-btn theme-toggle" aria-label={label} title={label} onClick={onToggleAppearance}>
        {appearance === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </>
  );
  if (compact) {
    return (
      <header className="header">
        <div className="header-row">
          <LogoMark size={24} />
          <h1 className="title">Brickyard</h1>
          {buttons}
        </div>
      </header>
    );
  }
  // Desktop: a top bar of its own, with About and the dark-mode button on the right.
  return (
    <div className="bar">
      <div className="bar-in">
        <header className="header-row">
          <LogoMark size={30} />
          <h1 className="title">Brickyard</h1>
        </header>
        {buttons}
      </div>
    </div>
  );
}
