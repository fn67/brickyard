import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentRef, type KeyboardEvent, type MutableRefObject, type PointerEvent } from 'react';
import { InstancedMesh, MOUSE, Spherical, TOUCH, Vector2, Vector3, type PerspectiveCamera } from 'three';
import type { AvatarModel } from '../engine';
import { DEFAULT_DISTANCE, DEFAULT_PRESET, MAX_DISTANCE, MIN_DISTANCE, type Preset } from '../render/presets';
import { layoutBlocks, presetOffset } from '../render/scene3d';
import type { Capture } from './exportImage';

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>;

/** What the buttons outside the canvas can do to the camera. */
export interface ViewApi {
  setPreset: (preset: Preset) => void;
  reset: () => void;
  zoom: (factor: number) => void;
  rotate: (azimuthDeg: number, elevationDeg: number) => void;
}

interface Props {
  model: AvatarModel;
  label: string;
  apiRef: MutableRefObject<ViewApi | null>;
  captureRef: MutableRefObject<Capture | null>;
  /** Called with the preset after a preset button, or null once the person drags or zooms away from it. */
  onPresetChange: (preset: Preset | null) => void;
  initialPreset?: Preset | null;
}

const ROTATE_STEP = 10;
const ZOOM_STEP = 0.85;

function Blocks({ model }: { model: AvatarModel }) {
  const layout = useMemo(() => layoutBlocks(model), [model]);
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    layout.blocks.forEach((b, i) => {
      m.setMatrixAt(i, b.matrix);
      m.setColorAt(i, b.color);
    });
    m.count = layout.blocks.length;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [layout]);
  return (
    <instancedMesh key={layout.blocks.length} ref={mesh} args={[undefined, undefined, layout.blocks.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

/** Wires camera moves and PNG capture to the outside world. Lives inside the Canvas. */
function Bridge({
  apiRef,
  captureRef,
  controls,
  target,
  onPresetChange,
  initialPreset,
}: Pick<Props, 'apiRef' | 'captureRef' | 'onPresetChange' | 'initialPreset'> & {
  controls: MutableRefObject<OrbitControlsImpl | null>;
  target: Vector3;
}) {
  const { gl, scene, camera, invalidate } = useThree();

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const place = (offset: Vector3) => {
      cam.position.copy(target).add(offset);
      cam.lookAt(target);
      controls.current?.target.copy(target);
      controls.current?.update();
      invalidate();
    };
    const distance = () => cam.position.distanceTo(target);
    const api: ViewApi = {
      setPreset: (p) => {
        place(presetOffset(p, distance()));
        onPresetChange(p);
      },
      reset: () => {
        place(presetOffset(DEFAULT_PRESET, DEFAULT_DISTANCE));
        onPresetChange(DEFAULT_PRESET);
      },
      zoom: (factor) => {
        const d = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, distance() * factor));
        place(cam.position.clone().sub(target).setLength(d));
      },
      rotate: (az, el) => {
        const s = new Spherical().setFromVector3(cam.position.clone().sub(target));
        s.theta += (az * Math.PI) / 180;
        s.phi = Math.min(Math.PI - 0.01, Math.max(0.01, s.phi - (el * Math.PI) / 180));
        place(new Vector3().setFromSpherical(s));
        onPresetChange(null);
      },
    };
    apiRef.current = api;
    place(presetOffset(initialPreset ?? DEFAULT_PRESET, DEFAULT_DISTANCE));

    // Renders the current camera angle at any size by resizing the drawing buffer for one frame.
    captureRef.current = (size) => {
      const prev = gl.getSize(new Vector2());
      const ratio = gl.getPixelRatio();
      gl.setPixelRatio(1);
      gl.setSize(size, size, false);
      cam.aspect = 1;
      cam.updateProjectionMatrix();
      gl.render(scene, cam);
      const out = document.createElement('canvas');
      out.width = size;
      out.height = size;
      out.getContext('2d')?.drawImage(gl.domElement, 0, 0, size, size);
      gl.setPixelRatio(ratio);
      gl.setSize(prev.x, prev.y, false);
      cam.aspect = prev.x / prev.y;
      cam.updateProjectionMatrix();
      gl.render(scene, cam);
      return out;
    };
    return () => {
      apiRef.current = null;
      captureRef.current = null;
    };
    // Set up once per mount; the camera keeps its angle when the model changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function Scene3D({ model, label, apiRef, captureRef, onPresetChange, initialPreset }: Props) {
  const layout = useMemo(() => layoutBlocks(model), [model]);
  const target = useMemo(() => new Vector3(0, 0, layout.centerZ), [layout.centerZ]);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent) => {
    const api = apiRef.current;
    if (!api) return;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => api.rotate(-ROTATE_STEP, 0),
      ArrowRight: () => api.rotate(ROTATE_STEP, 0),
      ArrowUp: () => api.rotate(0, ROTATE_STEP),
      ArrowDown: () => api.rotate(0, -ROTATE_STEP),
      '+': () => api.zoom(ZOOM_STEP),
      '=': () => api.zoom(ZOOM_STEP),
      '-': () => api.zoom(1 / ZOOM_STEP),
      _: () => api.zoom(1 / ZOOM_STEP),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      move();
    }
  };

  // Dragging leaves the preset angle; zooming keeps it.
  const onPointerMove = (e: PointerEvent) => {
    if (e.buttons !== 0) onPresetChange(null);
  };

  return (
    <div ref={wrap} className="scene3d" role="group" tabIndex={0} aria-label={label} onKeyDown={onKeyDown} onPointerMove={onPointerMove}>
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop="demand"
        gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
        camera={{ fov: 35, near: 0.1, far: 200, position: presetOffset(initialPreset ?? DEFAULT_PRESET).add(target).toArray() }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {model.background && <color attach="background" args={[model.background]} />}
        <hemisphereLight args={['#ffffff', '#8a8a8a', 1.6]} />
        <directionalLight position={[6, 12, 14]} intensity={1.4} />
        <directionalLight position={[-8, 4, 6]} intensity={0.35} />
        <Blocks model={model} />
        {model.background && (
          <ContactShadows
            position={[0, layout.groundY - 0.001, layout.centerZ]}
            scale={model.width * 1.8}
            blur={2.4}
            far={model.height}
            opacity={0.45}
            resolution={512}
            frames={Infinity}
          />
        )}
        <OrbitControls
          ref={controls}
          makeDefault
          target={target}
          enablePan={false}
          enableDamping={false}
          minDistance={MIN_DISTANCE}
          maxDistance={MAX_DISTANCE}
          mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }}
          touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
        />
        <Bridge
          apiRef={apiRef}
          captureRef={captureRef}
          controls={controls}
          target={target}
          onPresetChange={onPresetChange}
          initialPreset={initialPreset}
        />
      </Canvas>
    </div>
  );
}
