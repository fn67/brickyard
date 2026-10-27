import type { BackgroundMode } from '../engine';
import { Segmented } from './Segmented';

interface Props {
  value: BackgroundMode;
  onChange: (bg: BackgroundMode) => void;
  className?: string;
}

export function BackgroundControl({ value, onChange, className }: Props) {
  return (
    <div className={'background-control ' + (className ?? '')}>
      <span id="lbl-bg" className="field-label">
        Background
      </span>
      <Segmented
        labelledBy="lbl-bg"
        className="segmented-fill"
        value={value}
        onChange={onChange}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'transparent', label: 'Transparent' },
        ]}
      />
    </div>
  );
}
