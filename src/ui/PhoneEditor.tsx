import { useRef, useState } from 'react';
import { styleInfo } from '../engine';
import { avatarAlt } from './avatarText';
import { BackgroundControl } from './BackgroundControl';
import { ColourControl } from './ColourControl';
import { DownloadSheet } from './DownloadSheet';
import { Header } from './Header';
import { DownloadIcon } from './icons';
import { ModeSwitch } from './ModeSwitch';
import { NameField } from './NameField';
import { PhoneTabs, type PhoneTab } from './PhoneTabs';
import { PreviewOverlays } from './PreviewOverlays';
import { Stage } from './Stage';
import { StyleGrid } from './StyleGrid';
import type { Appearance } from './useAppearance';
import type { AvatarState } from './useAvatarState';
import type { ExportControls } from './useExport';
import type { View3d } from './useView3d';
import { useViewportHeight } from './useViewportHeight';
import { Variations } from './Variations';

interface Props {
  state: AvatarState;
  exporter: ExportControls;
  view3d: View3d;
  appearance: Appearance;
  onToggleAppearance: () => void;
}

/** The single-screen phone editor: preview on top, tabs for Style, Variations and Colour below. */
export function PhoneEditor({ state, exporter, view3d, appearance, onToggleAppearance }: Props) {
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
      <Header compact appearance={appearance} onToggleAppearance={onToggleAppearance} />
      <NameField value={state.field} onChange={state.setField} onShuffle={state.shuffle} onFocusChange={setTyping} />

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
            <button type="button" className="btn phone-btn" onClick={exporter.copy}>
              Copy PNG
            </button>
            <button
              ref={downloadBtn}
              type="button"
              className="btn phone-btn phone-download"
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              onClick={() => setSheetOpen(true)}
            >
              <DownloadIcon size={16} />
              Download
            </button>
          </div>
        )}

        <div className="dock">
          {!typing && (
            <div id="phone-panel" role="tabpanel" aria-labelledby={'tab-' + tab} className="dock-panel">
              {tab === 'style' && (
                <StyleGrid compact name={state.name} style={state.style} hue={state.hue} background={state.background} onPick={state.setStyle} />
              )}
              {tab === 'variations' && (
                <Variations
                  showHeading={false}
                  name={state.name}
                  names={state.variations}
                  variation={state.variation}
                  style={state.style}
                  hue={state.hue}
                  background={state.background}
                  onPick={state.setField}
                  onUseOriginal={state.useOriginal}
                />
              )}
              {tab === 'colour' && (
                <div className="colour-tab">
                  <ColourControl hue={state.hue} onChange={state.setHue} />
                  <BackgroundControl value={state.background} onChange={state.setBackground} />
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
