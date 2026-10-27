import { generateAvatar, STYLES, type StyleId } from '../engine';
import { AvatarCanvas } from './AvatarCanvas';
import { CubeIcon } from './icons';

interface Props {
  name: string;
  style: StyleId;
  hue: number | null;
  onPick: (style: StyleId) => void;
  compact?: boolean;
}

/** Tiles always show the Light background; the Background control only changes the large preview, size previews and exports. */
export function StyleGrid({ name, style, hue, onPick, compact }: Props) {
  return (
    <div className={compact ? 'style-grid style-grid-compact' : 'style-grid'}>
      {STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          className="tile style-tile"
          aria-pressed={s.id === style}
          aria-label={s.name + ' style, ' + s.grid + (s.has3d ? ', 3D available' : '')}
          onClick={() => onPick(s.id)}
        >
          <span className="tile-img">
            <span className="tile-art">
              <AvatarCanvas className="tile-avatar" model={generateAvatar(name, { style: s.id, hue, background: 'light' })} />
              {s.has3d && (
                <span className="badge-3d" aria-hidden="true">
                  {!compact && <CubeIcon size={12} strokeWidth={2.2} />}
                  3D
                </span>
              )}
            </span>
          </span>
          <span className="tile-text">
            <span className="tile-name">{s.name}</span>
            {!compact && <span className="tile-meta">{s.grid}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
