import type { ReactNode } from 'react';
import { styleInfo } from '../engine';
import { AvatarCanvas } from './AvatarCanvas';
import { avatarAlt } from './avatarText';
import { BackgroundControl } from './BackgroundControl';
import { CopyIcon } from './icons';
import { DownloadMenu } from './DownloadMenu';
import { ModeSwitch } from './ModeSwitch';
import { PreviewOverlays } from './PreviewOverlays';
import { Stage } from './Stage';
import type { AvatarState } from './useAvatarState';
import type { ExportControls } from './useExport';

interface Props {
  state: AvatarState;
  exporter: ExportControls;
  /** False when the device cannot draw 3D. */
  webgl: boolean;
  scene?: ReactNode;
  viewControls?: ReactNode;
}

export function PreviewPanel({ state, exporter, webgl, scene, viewControls }: Props) {
  const info = styleInfo(state.style);
  const can3d = info.has3d && webgl;
  return (
    <section className="panel preview-panel" aria-label="Preview">
      <div className="panel-head">
        <h2 className="panel-title">Preview</h2>
        <ModeSwitch view={state.view} can3d={can3d} onChange={state.setView} noteId="note3d" />
      </div>
      <div className="stage-fit">
        <Stage
          className="preview-stage"
          model={state.model}
          background={state.background}
          alt={avatarAlt(state.name, state.style)}
          scene={state.view === '3d' ? scene : undefined}
        >
          <PreviewOverlays
            toast={exporter.toast}
            is3d={state.view === '3d'}
            has3d={info.has3d}
            webgl={webgl}
            hint="Drag to rotate, scroll to zoom"
            onTryCritter={state.tryCritter}
            controls={viewControls}
          />
        </Stage>
      </div>

      <BackgroundControl className="preview-bg" value={state.background} onChange={state.setBackground} />

      <div className="details">
        <div className="ladder">
          {[56, 48, 20].map((px) => (
            <div key={px} className="ladder-item">
              <div className={'ladder-avatar ladder-' + px}>
                <AvatarCanvas model={state.model} />
              </div>
              <span className="mono-caption">{px} px</span>
            </div>
          ))}
        </div>
        <dl className="facts">
          <dt>Style</dt>
          <dd>{info.name}</dd>
          <dt>Grid</dt>
          <dd>{info.grid}</dd>
          <dt>Name</dt>
          <dd className="mono">{state.name}</dd>
        </dl>
      </div>

      <div className="actions">
        <button type="button" className="btn btn-lg" onClick={exporter.copy}>
          <CopyIcon />
          Copy PNG
        </button>
        <DownloadMenu onDownload={exporter.download} />
      </div>
    </section>
  );
}
