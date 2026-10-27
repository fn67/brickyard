import type { BackgroundMode } from '../engine';
import { Segmented } from './Segmented';

interface Props {
  value: BackgroundMode;
  onChange: (bg: BackgroundMode) => void;
  /** Icon-only swatch buttons with tooltips (desktop preview header) instead of the labelled control. */
  icons?: boolean;
  className?: string;
}

const MODES: { value: BackgroundMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'transparent', label: 'Transparent' },
];

export function BackgroundControl({ value, onChange, icons, className }: Props) {
  if (icons) {
    return (
      <Segmented
        label="Background"
        className={'bg-icons ' + (className ?? '')}
        value={value}
        onChange={onChange}
        options={MODES.map((m) => ({
          value: m.value,
          label: <span className={'bg-swatch bg-swatch-' + m.value} aria-hidden="true" />,
          ariaLabel: m.label + ' background',
          title: m.label + ' background',
        }))}
      />
    );
  }
  return (
    <div className={'background-control ' + (className ?? '')}>
      <span id="lbl-bg" className="field-label">
        Background
      </span>
      <Segmented labelledBy="lbl-bg" className="segmented-fill" value={value} onChange={onChange} options={MODES} />
    </div>
  );
}
