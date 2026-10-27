import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { DownloadIcon } from './icons';
import { PNG_SIZES } from './exportImage';

interface Props {
  onDownload: (size: number) => void;
}

/** The PNG sizes, then SVG and STL shown as disabled "Soon" items. Shared by the menu and the phone sheet. */
export function DownloadItems({ onPick, role }: { onPick: (size: number) => void; role?: 'menuitem' }) {
  return (
    <>
      {PNG_SIZES.map((n) => (
        <button key={n} type="button" role={role} className="item" onClick={() => onPick(n)}>
          PNG {n}
          <span className="item-dim">
            {n} × {n}
          </span>
        </button>
      ))}
      <div className="item-sep" role={role ? 'separator' : undefined} aria-hidden={role ? undefined : true} />
      <button type="button" role={role} className="item" disabled aria-disabled="true">
        Download as SVG
        <span className="soon">Soon</span>
      </button>
      <button type="button" role={role} className="item" disabled aria-disabled="true">
        Download as STL
        <span className="soon">Soon</span>
      </button>
    </>
  );
}

/** The icon-only Download button in the desktop preview header and its menu, which opens downward. */
export function DownloadMenu({ onDownload }: Props) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const items = () => Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      list[(i + 1) % list.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      list[(i - 1 + list.length) % list.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      list[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      list[list.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="download" ref={wrap} onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        className="btn icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="download-menu"
        aria-label="Download"
        title="Download"
        onClick={() => setOpen((o) => !o)}
      >
        <DownloadIcon />
      </button>
      {open && (
        <div id="download-menu" ref={menu} role="menu" aria-label="Download options" className="menu">
          <DownloadItems
            role="menuitem"
            onPick={(n) => {
              close(true);
              onDownload(n);
            }}
          />
        </div>
      )}
    </div>
  );
}
