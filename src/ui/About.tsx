import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ABOUT, type Inline } from '../content/about';
import { CloseIcon } from './icons';
import { MirrorDiagram } from './MirrorDiagram';

interface Props {
  /** Full-screen sheet (phone widths) instead of the centred dialog. */
  sheet: boolean;
  onClose: () => void;
  /** Gets focus back when About closes (the "i" button). */
  returnFocus: RefObject<HTMLElement | null>;
}

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';

function renderInline(parts: Inline[]) {
  return parts.map((p, i) =>
    typeof p === 'string' ? (
      p
    ) : (
      <code key={i} className="about-code">
        {p.code}
      </code>
    ),
  );
}

/** "What is Brickyard?": a centred dialog on wide screens, a full-screen sheet on phones. */
export function About({ sheet, onClose, returnFocus }: Props) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  // While open: the page behind is inert and does not scroll; on close, focus goes back to the "i" button.
  useEffect(() => {
    const root = document.getElementById('root');
    const opener = returnFocus.current;
    root?.setAttribute('inert', '');
    document.documentElement.classList.add('about-open');
    closeBtn.current?.focus();
    return () => {
      root?.removeAttribute('inert');
      document.documentElement.classList.remove('about-open');
      (returnFocus.current ?? opener)?.focus();
    };
  }, [returnFocus]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !dialog.current) return;
    // Keep Tab and Shift+Tab inside the dialog: wrap from the last control to the first and back.
    const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    const inside = !!active && dialog.current.contains(active);
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault();
      first?.focus();
    }
  };

  return createPortal(
    <div className={sheet ? 'about-layer about-sheet' : 'about-layer'} onKeyDown={onKeyDown}>
      {!sheet && <div className="about-scrim" aria-hidden="true" onClick={onClose} />}
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="about-title" className="about">
        <div className="about-head">
          <h2 id="about-title" className="about-title">
            {ABOUT.title}
          </h2>
          <button
            ref={closeBtn}
            type="button"
            className="btn icon-btn plain-icon-btn about-close"
            aria-label={ABOUT.close}
            title={ABOUT.close}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        {/* Focusable so the text can be scrolled with the keyboard. */}
        <div className="about-body" tabIndex={0} aria-labelledby="about-title">
          <p>{renderInline(ABOUT.intro)}</p>
          {ABOUT.sections.map((s) => (
            <section key={s.heading} className="about-sec">
              <h3>{s.heading}</h3>
              {s.lead && <p className="about-lead">{s.lead}</p>}
              {s.paragraphs?.map((p, i) => (
                <p key={i}>{renderInline(p)}</p>
              ))}
              {s.steps && (
                <ol className="about-steps">
                  {s.steps.map((step, i) => (
                    <li key={step.lead} className="about-step">
                      <span className="about-num" aria-hidden="true">
                        {i + 1}
                      </span>
                      <div>
                        <p>
                          <strong>{step.lead}</strong> {step.text}
                        </p>
                        {step.diagram && <MirrorDiagram />}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
