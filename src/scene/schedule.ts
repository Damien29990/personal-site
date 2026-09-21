import type { Cell, TimedCell } from "@/scene/voxels";

export const LOOP_SECONDS = 60;
export const TEARDOWN_SECONDS = 2;
export const BUILD_SECONDS = LOOP_SECONDS - TEARDOWN_SECONDS;

export type Stage = {
  id: string;
  label: string;
  from: number;
};

export const STAGES: readonly Stage[] = [
  { id: "setup", label: "Site setup", from: 0 },
  { id: "foundation", label: "Foundation", from: 5 },
  { id: "crane", label: "Crane erection", from: 12 },
  { id: "structure", label: "Structure", from: 20 },
  { id: "envelope", label: "Envelope", from: 42 },
  { id: "facilities", label: "Site facilities", from: 48 },
  { id: "iot", label: "IoT commissioning", from: 52 },
  { id: "handover", label: "Handover", from: BUILD_SECONDS },
];

export function wrapTime(seconds: number): number {
  return ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
}

/**
 * Build progress in seconds. Rises with the clock until the site is complete,
 * then runs backwards through the teardown window so t = 0 meets t = 60 on an
 * empty lot and the loop has no seam.
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

/**
 * Spreads a group of cells across a stage window and returns them sorted by
 * placement time, which is what the timed instancing relies on.
 */
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
