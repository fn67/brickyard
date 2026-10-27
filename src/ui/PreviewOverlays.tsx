import type { ReactNode } from 'react';
import { tryCritterAndFocus } from './focus';
import { StatusMessage, type Toast } from './StatusMessage';

interface Props {
  toast: Toast;
  is3d: boolean;
  /** The current style has a 3D view (Critter). */
  has3d: boolean;
  webgl: boolean;
  hint: string;
  onTryCritter: () => void;
  /** The 3D chips, shown along the bottom in 3D. */
  controls?: ReactNode;
  compact?: boolean;
}

export const NO_WEBGL_NOTE = '3D is not available on this device.';

/** Messages and 3D chips laid over the preview, so they never add height to the page. */
export function PreviewOverlays({ toast, is3d, has3d, webgl, hint, onTryCritter, controls, compact }: Props) {
  return (
    <>
      <div role="status" aria-live="polite" className="stage-top">
        <StatusMessage toast={toast} compact={compact} />
        {is3d && toast === 'none' && <div className="stage-hint">{hint}</div>}
      </div>
      <div className="stage-bottom">
        {!has3d && (
          <div className="stage-note">
            <span id="note3d">3D is available for Critter.</span>
            {webgl && (
              <button type="button" className="link" onClick={() => tryCritterAndFocus(onTryCritter)}>
                Try it
              </button>
            )}
          </div>
        )}
        {has3d && !webgl && (
          <div className="stage-note">
            <span id="note3d">{NO_WEBGL_NOTE}</span>
          </div>
        )}
        {is3d && controls}
      </div>
    </>
  );
}
