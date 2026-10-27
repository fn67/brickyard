import { useCallback, useEffect, useRef, useState } from 'react';
import type { AvatarModel, StyleId } from '../engine';
import { copyPng, downloadPng, flatCapture, pngFileName, type Capture } from './exportImage';
import type { Toast } from './StatusMessage';
import type { View } from './useAvatarState';

export interface ExportControls {
  toast: Toast;
  copy: () => void;
  download: (size: number) => void;
  /** The 3D view registers its capture here while it is shown. */
  capture3d: React.MutableRefObject<Capture | null>;
}

/** Copy PNG and Download PNG of whatever is on screen: the flat avatar, or the 3D view at its current angle. */
export function useExport(model: AvatarModel, name: string, style: StyleId, view: View): ExportControls {
  const [toast, setToast] = useState<Toast>('none');
  const capture3d = useRef<Capture | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const current = useCallback((): Capture => {
    if (view === '3d' && capture3d.current) return capture3d.current;
    return flatCapture(model);
  }, [model, view]);

  const copy = useCallback(() => {
    void copyPng(current()).then((result) => {
      setToast(result);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setToast('none'), result === 'copied' ? 3000 : 6000);
    });
  }, [current]);

  const download = useCallback(
    (size: number) => {
      void downloadPng(current(), pngFileName(name, style, size), size);
    },
    [current, name, style],
  );

  return { toast, copy, download, capture3d };
}
