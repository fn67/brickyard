import { useEffect, useRef, type KeyboardEvent } from 'react';
import { DownloadItems } from './DownloadMenu';

interface Props {
  onDownload: (size: number) => void;
  onClose: () => void;
}

/** The phone's Download options, as a bottom sheet over the editor. */
export function DownloadSheet({ onDownload, onClose }: Props) {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sheet.current?.querySelector<HTMLButtonElement>('.item:not(:disabled)')?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !sheet.current) return;
    // Keep focus inside the sheet while it is open.
    const items = Array.from(sheet.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="sheet-layer" onKeyDown={onKeyDown}>
      <button type="button" className="scrim" aria-label="Close download options" tabIndex={-1} onClick={onClose} />
      <div ref={sheet} role="dialog" aria-modal="true" aria-labelledby="sheet-title" className="sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 id="sheet-title" className="sheet-title">
          Download
        </h2>
        <DownloadItems
          onPick={(n) => {
            onClose();
            onDownload(n);
          }}
        />
      </div>
    </div>
  );
}
