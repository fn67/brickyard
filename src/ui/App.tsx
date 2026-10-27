import { Header } from './Header';
import { NameField } from './NameField';
import { PreviewPanel } from './PreviewPanel';
import { StylesPanel } from './StylesPanel';
import { useAppearance } from './useAppearance';
import { useAvatarState } from './useAvatarState';
import { useExport } from './useExport';
import { useView3d } from './useView3d';

export function App() {
  const { appearance, toggle } = useAppearance();
  const state = useAvatarState();
  const exporter = useExport(state.model, state.name, state.style, state.view);
  const view3d = useView3d(state, exporter.capture3d);

  return (
    <div className="app desktop">
      <Header appearance={appearance} onToggleAppearance={toggle} />
      <NameField value={state.field} onChange={state.setField} onShuffle={state.shuffle} />
      <main className="workspace">
        <PreviewPanel
          state={state}
          exporter={exporter}
          webgl={view3d.webgl}
          scene={view3d.scene}
          viewControls={view3d.controls({ hint: 'Drag to rotate, scroll to zoom', zoomButtons: true })}
        />
        <StylesPanel state={state} />
      </main>
    </div>
  );
}
