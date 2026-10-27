import { useCallback, useMemo, useState } from 'react';
import {
  baseName,
  DEFAULT_NAME,
  effectiveName,
  generateAvatar,
  shuffleName,
  styleInfo,
  variationNames,
  variationNumber,
  type AvatarModel,
  type BackgroundMode,
  type StyleId,
} from '../engine';

export type View = '2d' | '3d';

export interface AvatarState {
  /** Exactly what is in the name field. */
  field: string;
  /** The name the engine draws: trimmed, or the default when empty. */
  name: string;
  style: StyleId;
  hue: number | null;
  background: BackgroundMode;
  view: View;
  model: AvatarModel;
  /** The six variation names for the current name. */
  variations: string[];
  /** The variation number in use, or 0 for the original. */
  variation: number;
  setField: (value: string) => void;
  shuffle: () => void;
  setStyle: (style: StyleId) => void;
  setHue: (hue: number | null) => void;
  setBackground: (bg: BackgroundMode) => void;
  setView: (view: View) => void;
  /** Selects Critter and switches to 3D. */
  tryCritter: () => void;
  useOriginal: () => void;
}

export function useAvatarState(): AvatarState {
  const [field, setField] = useState(DEFAULT_NAME);
  const [style, setStyleRaw] = useState<StyleId>('classic');
  const [hue, setHue] = useState<number | null>(null);
  const [background, setBackground] = useState<BackgroundMode>('light');
  const [view, setViewRaw] = useState<View>('2d');

  const name = effectiveName(field);
  const has3d = styleInfo(style).has3d;
  // Selecting a style without 3D always returns to 2D.
  const effectiveView: View = has3d ? view : '2d';

  const model = useMemo(() => generateAvatar(name, { style, hue, background }), [name, style, hue, background]);
  const variations = useMemo(() => variationNames(name), [name]);

  const setStyle = useCallback((next: StyleId) => {
    setStyleRaw(next);
    if (!styleInfo(next).has3d) setViewRaw('2d');
  }, []);

  const setView = useCallback(
    (next: View) => {
      if (next === '3d' && !has3d) return;
      setViewRaw(next);
    },
    [has3d],
  );

  return {
    field,
    name,
    style,
    hue,
    background,
    view: effectiveView,
    model,
    variations,
    variation: variationNumber(name),
    setField,
    shuffle: useCallback(() => setField(shuffleName()), []),
    setStyle,
    setHue,
    setBackground,
    setView,
    tryCritter: useCallback(() => {
      setStyleRaw('critter');
      setViewRaw('3d');
    }, []),
    useOriginal: useCallback(() => setField(baseName(effectiveName(field))), [field]),
  };
}
