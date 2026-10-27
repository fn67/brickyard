import type { AvatarModel, StyleId } from '../engine';
import { drawAvatar } from '../render/canvas';

/** Produces a square image of the current view at the given size in pixels. */
export type Capture = (size: number) => HTMLCanvasElement;

export const COPY_SIZE = 460;
export const PNG_SIZES = [512, 1024, 2048] as const;

export function flatCapture(model: AvatarModel): Capture {
  return (size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) drawAvatar(ctx, model, size);
    return canvas;
  };
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode PNG'))), 'image/png');
  });
}

/** For example "hello-world-classic-1024.png". Characters that file systems reject become "-". */
export function pngFileName(name: string, style: StyleId, size: number): string {
  const safe = name.replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '') || 'avatar';
  return `${safe}-${style}-${size}.png`;
}

export type CopyResult = 'copied' | 'blocked';

export async function copyPng(capture: Capture): Promise<CopyResult> {
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') return 'blocked';
    // Passing a promise keeps Safari's user-gesture check happy.
    const blob = canvasToBlob(capture(COPY_SIZE));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return 'copied';
  } catch {
    return 'blocked';
  }
}

export async function downloadPng(capture: Capture, fileName: string, size: number): Promise<void> {
  const blob = await canvasToBlob(capture(size));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
