import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { DropIcon, GridIcon, LayersIcon } from './icons';

export type PhoneTab = 'style' | 'variations' | 'colour';

const TABS: { id: PhoneTab; label: string; icon: ReactNode }[] = [
  { id: 'style', label: 'Style', icon: <GridIcon /> },
  { id: 'variations', label: 'Variations', icon: <LayersIcon /> },
  { id: 'colour', label: 'Colour', icon: <DropIcon /> },
];

interface Props {
  tab: PhoneTab;
  onChange: (tab: PhoneTab) => void;
}

export function PhoneTabs({ tab, onChange }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = TABS[(i + step + TABS.length) % TABS.length].id;
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label="Customise" className="tabs" onKeyDown={onKeyDown}>
      {TABS.map((t) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[t.id] = el;
          }}
          id={'tab-' + t.id}
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === t.id}
          aria-controls="phone-panel"
          tabIndex={tab === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
