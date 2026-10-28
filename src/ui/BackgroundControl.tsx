import type { BackgroundMode } from '../engine';
import { Segmented } from './Segmented';

interface Props {
  value: BackgroundMode;
  onChange: (bg: BackgroundMode) => void;
  /** Show the "Background" label beside the icons (phone Colour tab); otherwise the group is named by aria-label. */
  showLabel?: boolean;
}

const MODES: { value: BackgroundMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'transparent', label: 'Transparent' },
];

/** Light, Dark and Transparent as icon-only swatch buttons, each with a tooltip and an accessible name. */
export function BackgroundControl({ value, onChange, showLabel }: Props) {
  const icons = (
    <Segmented
      label={showLabel ? undefined : 'Background'}
      labelledBy={showLabel ? 'lbl-bg' : undefined}
      className="bg-icons"
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
  if (!showLabel) return icons;
  return (
    <div className="background-control">
      <span id="lbl-bg" className="field-label">
        Background
      </span>
      {icons}
    </div>
  );
}
