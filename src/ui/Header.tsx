import { LogoMark, MoonIcon, SunIcon } from './icons';
import type { Appearance } from './useAppearance';

interface Props {
  appearance: Appearance;
  onToggleAppearance: () => void;
  compact?: boolean;
}

export const TAGLINE = 'Pixel avatars for people who hate profile pictures.';

export function Header({ appearance, onToggleAppearance, compact }: Props) {
  const label = appearance === 'dark' ? 'Switch app to light mode' : 'Switch app to dark mode';
  return (
    <header className="header">
      <div className="header-row">
        <LogoMark size={compact ? 24 : 30} />
        <h1 className="title">Brickyard</h1>
        <button type="button" className="btn icon-btn theme-toggle" aria-label={label} title={label} onClick={onToggleAppearance}>
          {appearance === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
      <p className="tagline">{TAGLINE}</p>
    </header>
  );
}
