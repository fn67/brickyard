import { useMemo } from 'react';
import { Header } from './Header';
import { NameField } from './NameField';
import { PreviewPanel } from './PreviewPanel';
import { StylesPanel } from './StylesPanel';
import { useAppearance } from './useAppearance';
import { useAvatarState } from './useAvatarState';
import { useExport } from './useExport';
import { hasWebGL } from './webgl';

export function App() {
  const { appearance, toggle } = useAppearance();
  const state = useAvatarState();
  const exporter = useExport(state.model, state.name, state.style, state.view);
  const webgl = useMemo(hasWebGL, []);

  return (
    <div className="app desktop">
      <Header appearance={appearance} onToggleAppearance={toggle} />
      <NameField value={state.field} onChange={state.setField} onShuffle={state.shuffle} />
      <main className="workspace">
        <PreviewPanel state={state} exporter={exporter} webgl={webgl} />
        <StylesPanel state={state} />
      </main>
    </div>
  );
}
