import type { Cell, TimedCell } from "@/scene/voxels";

/** 90s of construction, then a short reverse so the loop meets on an empty lot. */
export const LOOP_SECONDS = 93;
export const TEARDOWN_SECONDS = 3;
export const BUILD_SECONDS = LOOP_SECONDS - TEARDOWN_SECONDS;

export type Stage = {
  id: string;
  label: string;
  from: number;
};

export const STAGES: readonly Stage[] = [
  { id: "setup", label: "Site setup", from: 0 },
  { id: "foundation", label: "Foundation", from: 10 },
  { id: "crane", label: "Crane placed", from: 22 },
  { id: "structure", label: "Structure", from: 32 },
  { id: "envelope", label: "Nets and scaffold", from: 52 },
  { id: "facilities", label: "Hoist and modules", from: 64 },
  { id: "iot", label: "IoT commissioning", from: 76 },
  { id: "handover", label: "Handover", from: BUILD_SECONDS },
];

export function wrapTime(seconds: number): number {
  return ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
}

/**
 * Build progress in seconds. Rises until handover, then runs backwards through
 * the teardown window so the loop has no seam.
 */
export function revealTime(seconds: number): number {
  const t = wrapTime(seconds);
  if (t < BUILD_SECONDS) return t;
  const progress = (t - BUILD_SECONDS) / TEARDOWN_SECONDS;
  return BUILD_SECONDS * (1 - progress);
}

export function stageIndexAt(seconds: number): number {
  const t = wrapTime(seconds);
  for (let index = STAGES.length - 1; index >= 0; index -= 1) {
    if (t >= STAGES[index]!.from) return index;
  }
  return 0;
}

export type BuildOrder = "bottom-up" | "from-center" | "sequential";

function radius(cell: Cell): number {
  return cell[0] * cell[0] + cell[2] * cell[2];
}

/** Kept for any voxel helper that still spreads cells across a window. */
export function assignBuildTimes(
  cells: readonly Cell[],
  from: number,
  to: number,
  order: BuildOrder,
): TimedCell[] {
  if (cells.length === 0) return [];

  const sorted = [...cells];
  if (order === "bottom-up") {
    sorted.sort((a, b) => a[1] - b[1] || radius(a) - radius(b));
  } else if (order === "from-center") {
    sorted.sort((a, b) => radius(a) - radius(b));
  }

  const span = Math.max(0, to - from);
  const step = sorted.length > 1 ? span / (sorted.length - 1) : 0;
  return sorted.map((cell, index) => ({ cell, at: from + index * step }));
}
