import { useRef, useState, type ReactNode } from 'react';
import { styleInfo } from '../engine';
import { avatarAlt } from './avatarText';
import { BackgroundControl } from './BackgroundControl';
import { ColourControl } from './ColourControl';
import { DownloadSheet } from './DownloadSheet';
import { CopyIcon, DownloadIcon } from './icons';
import { ModeSwitch } from './ModeSwitch';
import { NameField } from './NameField';
import { PhoneTabs, type PhoneTab } from './PhoneTabs';
import { PreviewOverlays } from './PreviewOverlays';
import { Stage } from './Stage';
import { StyleGrid } from './StyleGrid';
import type { AvatarState } from './useAvatarState';
import type { ExportControls } from './useExport';
import type { View3d } from './useView3d';
import { useViewportHeight } from './useViewportHeight';
import { Variations } from './Variations';

interface Props {
  state: AvatarState;
  exporter: ExportControls;
  view3d: View3d;
  /** The top bar, built by App so About and the theme switch work the same on both layouts. */
  header: ReactNode;
}

/** The single-screen phone editor: preview on top, tabs for Style, Variations and Colour below. */
export function PhoneEditor({ state, exporter, view3d, header }: Props) {
  const [tab, setTab] = useState<PhoneTab>('style');
  const [typing, setTyping] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const downloadBtn = useRef<HTMLButtonElement>(null);
  const height = useViewportHeight();

  const info = styleInfo(state.style);
  const can3d = info.has3d && view3d.webgl;
  const is3d = state.view === '3d';

  const closeSheet = () => {
    setSheetOpen(false);
    downloadBtn.current?.focus();
  };

  return (
    <div className="app phone" style={height ? { height } : undefined}>
      {header}
      <NameField placeholder="Username, name or any string" value={state.field} onChange={state.setField} onShuffle={state.shuffle} onFocusChange={setTyping} />

      <main className="phone-main">
        <div className="phone-stage-area">
          <Stage
            className={is3d ? 'phone-stage phone-stage-wide' : 'phone-stage'}
            model={state.model}
            background={state.background}
            alt={avatarAlt(state.name, state.style)}
            scene={is3d ? view3d.scene : undefined}
          >
            <PreviewOverlays
              compact
              toast={exporter.toast}
              is3d={is3d}
              has3d={info.has3d}
              webgl={view3d.webgl}
              hint="Drag to rotate, pinch to zoom"
              onTryCritter={state.tryCritter}
              controls={view3d.controls({})}
            />
          </Stage>
        </div>

        {!typing && (
          <div className="phone-actions">
            <ModeSwitch compact view={state.view} can3d={can3d} onChange={state.setView} noteId="note3d" />
            <button
              type="button"
              className="btn icon-btn phone-icon-btn phone-copy"
              aria-label="Copy PNG"
              title="Copy PNG"
              onClick={exporter.copy}
            >
              <CopyIcon />
            </button>
            <button
              ref={downloadBtn}
              type="button"
              className="btn icon-btn phone-icon-btn"
              aria-label="Download"
              title="Download"
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              onClick={() => setSheetOpen(true)}
            >
              <DownloadIcon />
            </button>
          </div>
        )}

        <div className="dock">
          {!typing && (
            <div id="phone-panel" role="tabpanel" aria-labelledby={'tab-' + tab} className="dock-panel">
              {tab === 'style' && (
                <StyleGrid compact name={state.name} style={state.style} hue={state.hue} onPick={state.setStyle} />
              )}
              {tab === 'variations' && (
                <Variations
                  showHeading={false}
                  name={state.name}
                  names={state.variations}
                  variation={state.variation}
                  style={state.style}
                  hue={state.hue}
                  onPick={state.setField}
                  onUseOriginal={state.useOriginal}
                />
              )}
              {tab === 'colour' && (
                <div className="colour-tab">
                  <ColourControl hue={state.hue} onChange={state.setHue} />
                  <BackgroundControl showLabel value={state.background} onChange={state.setBackground} />
                </div>
              )}
            </div>
          )}
          <PhoneTabs tab={tab} onChange={setTab} />
        </div>
      </main>

      {sheetOpen && <DownloadSheet onDownload={exporter.download} onClose={closeSheet} />}
    </div>
  );
}
