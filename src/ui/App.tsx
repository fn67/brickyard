import { useRef, useState } from 'react';
import { About } from './About';
import { Header } from './Header';
import { NameField } from './NameField';
import { PhoneEditor } from './PhoneEditor';
import { PreviewPanel } from './PreviewPanel';
import { StylesPanel } from './StylesPanel';
import { useAppearance } from './useAppearance';
import { useAvatarState } from './useAvatarState';
import { useExport } from './useExport';
import { PHONE_QUERY, useMediaQuery } from './useMediaQuery';
import { useView3d } from './useView3d';

export function App() {
  const { appearance, toggle } = useAppearance();
  const state = useAvatarState();
  const exporter = useExport(state.model, state.name, state.style, state.view);
  const view3d = useView3d(state, exporter.capture3d);
  const phone = useMediaQuery(PHONE_QUERY);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutBtn = useRef<HTMLButtonElement>(null);

  const header = (
    <Header compact={phone} appearance={appearance} onToggleAppearance={toggle} onAbout={() => setAboutOpen(true)} aboutRef={aboutBtn} />
  );

  const about = aboutOpen && <About sheet={phone} onClose={() => setAboutOpen(false)} returnFocus={aboutBtn} />;

  if (phone) {
    return (
      <>
        <PhoneEditor state={state} exporter={exporter} view3d={view3d} header={header} />
        {about}
      </>
    );
  }

  return (
    <>
      <div className="app desktop">
        {header}
        <div className="desktop-wrap">
          <NameField
            placeholder="Enter anything to see your avatar: a username, name or any string"
            value={state.field}
            onChange={state.setField}
            onShuffle={state.shuffle}
          />
          <main className="workspace">
            <PreviewPanel
              state={state}
              exporter={exporter}
              webgl={view3d.webgl}
              scene={view3d.scene}
              viewControls={view3d.controls({ zoomButtons: true })}
            />
            <StylesPanel state={state} />
          </main>
        </div>
      </div>
      {about}
    </>
  );
}
