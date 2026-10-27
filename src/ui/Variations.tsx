import { generateAvatar, type StyleId } from '../engine';
import { AvatarCanvas } from './AvatarCanvas';

interface Props {
  name: string;
  names: string[];
  variation: number;
  style: StyleId;
  hue: number | null;
  onPick: (name: string) => void;
  onUseOriginal: () => void;
  showHeading?: boolean;
}

export function Variations({ name, names, variation, style, hue, onPick, onUseOriginal, showHeading = true }: Props) {
  // On desktop the note sits on the heading line; on the phone tab it sits under the thumbnails.
  const note = variation > 0 && (
    <div className="variation-note">
      <span>Using variation {variation}</span>
      <button type="button" className="link" onClick={onUseOriginal}>
        Use original
      </button>
    </div>
  );
  return (
    <div className="variations">
      <div className={showHeading ? 'variations-head' : undefined}>
        {showHeading && <h2 className="panel-title">Variations</h2>}
        <p className="hint">Not quite right? Try another.</p>
        {showHeading && note}
      </div>
      <div className="variation-grid">
        {names.map((n, i) => (
          <button
            key={n}
            type="button"
            className="tile variation-tile"
            aria-pressed={n === name}
            aria-label={i === 0 ? 'Original, ' + n : 'Variation ' + i + ', ' + n}
            onClick={() => onPick(n)}
          >
            <AvatarCanvas model={generateAvatar(n, { style, hue, background: 'light' })} />
          </button>
        ))}
      </div>
      {!showHeading && note}
    </div>
  );
}
