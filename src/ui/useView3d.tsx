import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { DEFAULT_PRESET, type Preset } from '../render/presets';
import { ErrorBoundary } from './ErrorBoundary';
import type { Capture } from './exportImage';
import type { ViewApi } from './Scene3D';
import type { AvatarState } from './useAvatarState';
import { ViewControls } from './ViewControls';
import { hasWebGL } from './webgl';

const Scene3D = lazy(() => import('./Scene3D'));

const ZOOM_STEP = 0.85;

export interface View3d {
  webgl: boolean;
  scene: React.ReactNode;
  controls: (opts: { zoomButtons?: boolean }) => React.ReactNode;
}

/** The single 3D scene and its controls. Falls back to 2D when WebGL is missing or fails. */
export function useView3d(state: AvatarState, captureRef: React.MutableRefObject<Capture | null>): View3d {
  const [webgl, setWebgl] = useState(hasWebGL);
  const [preset, setPreset] = useState<Preset | null>(DEFAULT_PRESET);
  const apiRef = useRef<ViewApi | null>(null);
  const { setView } = state;

  const onError = useCallback(() => {
    setWebgl(false);
    setView('2d');
  }, [setView]);

  const label = '3D view of ' + state.name + ' in the Critter style, built from blocks. Arrow keys rotate, plus and minus zoom.';

  const scene = useMemo(
    () =>
      webgl && state.view === '3d' ? (
        <ErrorBoundary onError={onError}>
          <Suspense fallback={<div className="scene3d scene3d-loading" aria-hidden="true" />}>
            <Scene3D
              model={state.model}
              label={label}
              apiRef={apiRef}
              captureRef={captureRef}
              onPresetChange={setPreset}
              initialPreset={preset}
            />
          </Suspense>
        </ErrorBoundary>
      ) : null,
    // The preset only seeds a new scene; it must not re-create the canvas when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [webgl, state.view, state.model, label, onError, captureRef],
  );

  const controls = useCallback(
    ({ zoomButtons }: { zoomButtons?: boolean }) => (
      <ViewControls
        preset={preset}
        onPreset={(p) => apiRef.current?.setPreset(p)}
        onReset={() => apiRef.current?.reset()}
        onZoom={zoomButtons ? (dir) => apiRef.current?.zoom(dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP) : undefined}
      />
    ),
    [preset],
  );

  return { webgl, scene, controls };
}
