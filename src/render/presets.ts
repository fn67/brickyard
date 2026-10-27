// Camera presets for the 3D view. Kept free of three.js so the main bundle does not load it.

export type Preset = 'front' | 'threeQuarter' | 'top' | 'side';

export const PRESETS: { id: Preset; label: string; azimuth: number; elevation: number }[] = [
  { id: 'front', label: 'Front', azimuth: 0, elevation: 0 },
  { id: 'threeQuarter', label: '3/4', azimuth: 32, elevation: 22 },
  { id: 'top', label: 'Top', azimuth: 0, elevation: 70 },
  { id: 'side', label: 'Side', azimuth: 90, elevation: 0 },
];

export const DEFAULT_PRESET: Preset = 'threeQuarter';
export const DEFAULT_DISTANCE = 20;
export const MIN_DISTANCE = 11;
export const MAX_DISTANCE = 36;
