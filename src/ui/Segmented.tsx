import type { ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  describedBy?: string;
  ariaLabel?: string;
  title?: string;
}

interface Props<T extends string> {
  label?: string;
  labelledBy?: string;
  value: T | null;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/** A row of toggle buttons where one is pressed, as in the design's 2D | 3D and Background controls. */
export function Segmented<T extends string>({ label, labelledBy, value, options, onChange, className }: Props<T>) {
  return (
    <div role="group" aria-label={label} aria-labelledby={labelledBy} className={'segmented ' + (className ?? '')}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="seg"
          aria-pressed={value === o.value}
          aria-describedby={o.describedBy}
          aria-label={o.ariaLabel}
          title={o.title}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
