import { useEffect, useRef, useState } from 'react';
import type { AvatarModel } from '../engine';
import { drawAvatar } from '../render/canvas';

interface Props {
  model: AvatarModel;
  /** Text alternative. Omit for decorative copies (the canvas is then hidden from assistive tech). */
  alt?: string;
  className?: string;
}

/** A flat avatar that fills its box and redraws at the device's pixel density. */
export function AvatarCanvas({ model, alt, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [px, setPx] = useState(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const measure = () => {
      const w = canvas.getBoundingClientRect().width;
      setPx(Math.max(1, Math.round(w * (window.devicePixelRatio || 1))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !px) return;
    if (canvas.width !== px) {
      canvas.width = px;
      canvas.height = px;
    }
    drawAvatar(ctx, model, px);
  }, [model, px]);

  return (
    <canvas
      ref={ref}
      className={className ? 'avatar ' + className : 'avatar'}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    />
  );
}
