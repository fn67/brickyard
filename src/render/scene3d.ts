import { Color, Matrix4, Quaternion, Vector3 } from 'three';
import type { AvatarModel } from '../engine';
import { DEFAULT_DISTANCE, PRESETS, type Preset } from './presets';

/** One box per cell that has height, in scene units: x right, y up, z towards the viewer. */
export interface Block {
  matrix: Matrix4;
  color: Color;
}

export interface SceneLayout {
  blocks: Block[];
  /** Height of the ground plane: the bottom of the lowest block. */
  groundY: number;
  /** Middle of the avatar's depth, which the camera orbits around. */
  centerZ: number;
}

/** Reads an AvatarModel and lays out matte boxes. Grid row 0 is the top of the character. */
export function layoutBlocks(model: AvatarModel): SceneLayout {
  const blocks: Block[] = [];
  let minY = Infinity;
  let maxZ = 0;
  const q = new Quaternion();
  for (const c of model.cells) {
    if (c.height <= 0) continue;
    const w = c.w ?? 1;
    const h = c.h ?? 1;
    const z0 = c.z ?? 0;
    const pos = new Vector3(c.x + w / 2 - model.width / 2, -(c.y + h / 2 - model.height / 2), z0 + c.height / 2);
    blocks.push({ matrix: new Matrix4().compose(pos, q, new Vector3(w, h, c.height)), color: new Color(c.color) });
    minY = Math.min(minY, pos.y - h / 2);
    maxZ = Math.max(maxZ, z0 + c.height);
  }
  return { blocks, groundY: Number.isFinite(minY) ? minY : -model.height / 2, centerZ: maxZ / 2 };
}

/** Camera offset from the orbit target for an azimuth and elevation in degrees. */
export function presetOffset(preset: Preset, distance = DEFAULT_DISTANCE): Vector3 {
  const p = PRESETS.find((x) => x.id === preset) ?? PRESETS[1];
  const az = (p.azimuth * Math.PI) / 180;
  const el = (p.elevation * Math.PI) / 180;
  return new Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(distance);
}
