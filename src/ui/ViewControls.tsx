import { PRESETS, type Preset } from '../render/presets';
import { MinusIcon, PlusIcon } from './icons';

interface Props {
  preset: Preset | null;
  onPreset: (preset: Preset) => void;
  onReset: () => void;
  onZoom?: (direction: 1 | -1) => void;
}

/** Angle presets, zoom and Reset view for the 3D view, as chips along the bottom of the preview. */
export function ViewControls({ preset, onPreset, onReset, onZoom }: Props) {
  return (
    <div role="group" aria-label="Viewing angle" className="chips">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          className="chip"
          aria-pressed={preset === p.id}
          aria-label={p.id === 'threeQuarter' ? 'Three-quarter' : undefined}
          onClick={() => onPreset(p.id)}
        >
          {p.label}
        </button>
      ))}
      {onZoom && (
        <>
          <button type="button" className="chip chip-icon" aria-label="Zoom out" onClick={() => onZoom(-1)}>
            <MinusIcon size={14} />
          </button>
          <button type="button" className="chip chip-icon" aria-label="Zoom in" onClick={() => onZoom(1)}>
            <PlusIcon size={14} />
          </button>
        </>
      )}
      <button type="button" className="chip" onClick={onReset}>
        Reset view
      </button>
    </div>
  );
}
