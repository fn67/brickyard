import { HUES } from '../engine';
import { CheckIcon } from './icons';

const HUE_NAMES: Record<number, string> = {
  0: 'Red', 28: 'Orange', 48: 'Yellow', 100: 'Lime', 160: 'Green',
  190: 'Teal', 215: 'Blue', 250: 'Violet', 285: 'Purple', 320: 'Pink',
};

export function hueLabel(hue: number): string {
  return (HUE_NAMES[hue] ?? 'Hue') + ', hue ' + hue + '°';
}

interface Props {
  hue: number | null;
  onChange: (hue: number | null) => void;
  /** Keep "Colour" for screen readers only (desktop); the phone shows it. */
  hideLabel?: boolean;
  className?: string;
}

const AUTO_LABEL = 'Auto, colour from the name';

export function ColourControl({ hue, onChange, hideLabel, className }: Props) {
  return (
    <div className={'colour-control ' + (className ?? '')}>
      <span id="lbl-colour" className={hideLabel ? 'visually-hidden' : 'field-label'}>
        Colour
      </span>
      <div role="group" aria-labelledby="lbl-colour" className="swatches">
        <button
          type="button"
          className="swatch"
          aria-pressed={hue === null}
          aria-label={AUTO_LABEL}
          title={AUTO_LABEL}
          onClick={() => onChange(null)}
        >
          <span className="swatch-fill swatch-auto" aria-hidden="true" />
        </button>
        {HUES.map((h) => {
          const on = hue === h;
          // Dark tick on yellow and lime, light tick on the rest, as in the design.
          const ink = h > 35 && h < 125 ? '#141414' : '#ffffff';
          return (
            <button
              key={h}
              type="button"
              className="swatch"
              aria-pressed={on}
              aria-label={hueLabel(h)}
              title={hueLabel(h)}
              onClick={() => onChange(h)}
            >
              <span className="swatch-fill" style={{ background: `hsl(${h} 62% 46%)`, color: ink }}>
                {on && <CheckIcon size={16} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
