import type { ReactNode } from 'react';
import type { AvatarModel, BackgroundMode } from '../engine';
import { AvatarCanvas } from './AvatarCanvas';

interface Props {
  model: AvatarModel;
  background: BackgroundMode;
  alt: string;
  /** Shown instead of the flat avatar (the 3D view). */
  scene?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** The preview viewport: a dot grid behind the flat avatar, or a checkerboard when Background is Transparent. */
export function Stage({ model, background, alt, scene, children, className }: Props) {
  const surface = background === 'transparent' ? 'stage-checker' : scene ? 'stage-plain' : 'stage-dots';
  // In 3D the whole viewport takes the scene background, so any margin around the canvas matches it.
  const sceneBg = scene && model.background ? { background: model.background } : undefined;
  return (
    <div className={['stage', surface, className].filter(Boolean).join(' ')} style={sceneBg}>
      {scene ?? (
        <div className="stage-center">
          <div className={background === 'transparent' ? 'stage-avatar' : 'stage-avatar stage-avatar-shadow'}>
            <AvatarCanvas model={model} alt={alt} />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
