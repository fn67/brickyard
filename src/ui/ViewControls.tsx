import { PRESETS, type Preset } from '../render/presets';
import { MinusIcon, PlusIcon } from './icons';
import { Segmented } from './Segmented';

interface Props {
  preset: Preset | null;
  onPreset: (preset: Preset) => void;
  onReset: () => void;
  onZoom?: (direction: 1 | -1) => void;
  hint: string;
  compact?: boolean;
}

/** Angle presets, zoom and Reset view for the 3D view. */
export function ViewControls({ preset, onPreset, onReset, onZoom, hint, compact }: Props) {
  if (compact) {
    return (
      <div role="group" aria-label="Viewing angle" className="chips">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className="chip" aria-pressed={preset === p.id} onClick={() => onPreset(p.id)}>
            {p.label}
          </button>
        ))}
        <button type="button" className="chip" onClick={onReset}>
          Reset view
        </button>
      </div>
    );
  }
  return (
    <div className="view-controls">
      <Segmented
        label="Viewing angle"
        className="segmented-fill"
        value={preset}
        onChange={onPreset}
        options={PRESETS.map((p) => ({ value: p.id, label: p.label, ariaLabel: p.id === 'threeQuarter' ? 'Three-quarter' : undefined }))}
      />
      <div className="view-row">
        <span className="view-hint">{hint}</span>
        <div className="view-buttons">
          {onZoom && (
            <>
              <button type="button" className="btn icon-btn" aria-label="Zoom out" onClick={() => onZoom(-1)}>
                <MinusIcon />
              </button>
              <button type="button" className="btn icon-btn" aria-label="Zoom in" onClick={() => onZoom(1)}>
                <PlusIcon />
              </button>
            </>
          )}
          <button type="button" className="btn" onClick={onReset}>
            Reset view
          </button>
        </div>
      </div>
    </div>
  );
}
