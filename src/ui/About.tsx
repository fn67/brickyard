import { useEffect, useRef, type KeyboardEvent } from 'react';
import { ABOUT, type Inline } from '../content/about';
import { CloseIcon } from './icons';
import { MirrorDiagram } from './MirrorDiagram';

interface Props {
  /** Full-screen sheet (phone widths) instead of the centred dialog. */
  sheet: boolean;
  onClose: () => void;
}

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
export function About({ sheet, onClose }: Props) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div className={sheet ? 'about-layer about-sheet' : 'about-layer'} onKeyDown={onKeyDown}>
      {!sheet && <div className="about-scrim" aria-hidden="true" onClick={onClose} />}
      <div role="dialog" aria-modal="true" aria-labelledby="about-title" className="about">
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
    </div>
  );
}
