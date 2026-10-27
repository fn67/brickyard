import { LogoMark, MoonIcon, SunIcon } from './icons';
import type { Appearance } from './useAppearance';

interface Props {
  appearance: Appearance;
  onToggleAppearance: () => void;
  compact?: boolean;
}

export function Header({ appearance, onToggleAppearance, compact }: Props) {
  const label = appearance === 'dark' ? 'Switch app to light mode' : 'Switch app to dark mode';
  const toggle = (
    <button type="button" className="btn icon-btn theme-toggle" aria-label={label} title={label} onClick={onToggleAppearance}>
      {appearance === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
  if (compact) {
    return (
      <header className="header">
        <div className="header-row">
          <LogoMark size={24} />
          <h1 className="title">Brickyard</h1>
          {toggle}
        </div>
      </header>
    );
  }
  // Desktop: a top bar of its own, with the dark-mode button on the right.
  return (
    <div className="bar">
      <div className="bar-in">
        <header className="header-row">
          <LogoMark size={30} />
          <h1 className="title">Brickyard</h1>
        </header>
        {toggle}
      </div>
    </div>
  );
}
