/** Shared easing helpers for the voxel-site lab. No React, no three — plain math. */

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Robert Penner "back out" easing — overshoots past 1 before settling.
 * Used for the imperative (non-spring) instanced parts: ground tiles, hoarding.
 */
export function backOut(t: number, overshoot = 1.7): number {
  const p = clamp01(t) - 1;
  return p * p * ((overshoot + 1) * p + overshoot) + 1;
}

export function easeInOutCubic(t: number): number {
  const p = clamp01(t);
  return p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
}

/** Evenly spreads `count` items across [from, to], returned as reveal timestamps. */
export function staggerTimes(count: number, from: number, to: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [from];
  const span = Math.max(0, to - from);
  const step = span / (count - 1);
  return Array.from({ length: count }, (_, index) => from + index * step);
}
