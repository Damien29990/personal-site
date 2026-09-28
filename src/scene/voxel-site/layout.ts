import { staggerTimes } from "@/scene/voxel-site/easing";
import { PHASES } from "@/scene/voxel-site/timeline";

/**
 * Procedural part positions for the 40F smart-site assembly lab. Pure data —
 * no React, no three.js. `BuildingAssemblyModel` turns this into meshes and
 * springs. All units are world units (roughly 1 unit ≈ one storey-scale
 * voxel), all timestamps are seconds within the build clock (see timeline.ts).
 */

export type Vec3 = readonly [number, number, number];

// ---- Global proportions --------------------------------------------------

export const TOWER_HALF = 2.0; // tower footprint half-extent (plan)
export const FLOOR_HEIGHT = 0.3;
export const PODIUM_FLOORS = 25;
export const STEEL_FLOORS = 15;
export const PODIUM_CHUNK_COUNT = 5; // 5 floors bundled per chunk pop
export const STEEL_CHUNK_COUNT = 5; // 3 floors bundled per chunk pop
export const GROUND_Y = 0;
export const PODIUM_TOP_Y = PODIUM_FLOORS * FLOOR_HEIGHT; // 7.5
export const ROOF_Y = (PODIUM_FLOORS + STEEL_FLOORS) * FLOOR_HEIGHT; // 12.0
export const PLAZA_HALF = 4.32;

const PHASE_1 = PHASES[0]!;
const PHASE_2 = PHASES[1]!;
const PHASE_3 = PHASES[2]!;
const PHASE_4 = PHASES[3]!;
const PHASE_5 = PHASES[4]!;

// ---- Phase 01 · Ground & foundation --------------------------------------

export type GroundTile = { position: Vec3; revealAt: number };

const PLAZA_GRID = 12;
const PLAZA_SPACING = (PLAZA_HALF * 2) / PLAZA_GRID;

/** Plaza tiles pop from the center outward, "snapping together like magnets". */
export function buildGroundTiles(): GroundTile[] {
  const raw: { position: Vec3; radius: number }[] = [];
  for (let i = 0; i < PLAZA_GRID; i += 1) {
    for (let j = 0; j < PLAZA_GRID; j += 1) {
      const x = (i - (PLAZA_GRID - 1) / 2) * PLAZA_SPACING;
      const z = (j - (PLAZA_GRID - 1) / 2) * PLAZA_SPACING;
      // Tile top face sits exactly at GROUND_Y, so everything else authored
      // against "y = ground" (workers, hoarding, crane wheels) reads flush.
      raw.push({ position: [x, GROUND_Y - 0.08, z], radius: Math.hypot(x, z) });
    }
  }
  raw.sort((a, b) => a.radius - b.radius);
  const times = staggerTimes(raw.length, PHASE_1.from, PHASE_1.from + 1.3);
  return raw.map((tile, index) => ({ position: tile.position, revealAt: times[index]! }));
}

export type HoardingPost = { position: Vec3; revealAt: number };

/** Perimeter hoarding, revealed sequentially walking the fence line. */
export function buildHoardingPosts(): HoardingPost[] {
  const spacing = 0.72;
  const raw: { position: Vec3; angle: number }[] = [];
  const half = PLAZA_HALF - 0.1;
  const steps = Math.round((half * 2) / spacing);
  for (let i = 0; i <= steps; i += 1) {
    const t = -half + i * spacing;
    raw.push({ position: [t, 0.55, -half], angle: Math.atan2(-half, t) });
    raw.push({ position: [t, 0.55, half], angle: Math.atan2(half, t) });
  }
  for (let i = 1; i < steps; i += 1) {
    const t = -half + i * spacing;
    raw.push({ position: [-half, 0.55, t], angle: Math.atan2(t, -half) });
    raw.push({ position: [half, 0.55, t], angle: Math.atan2(t, half) });
  }
  raw.sort((a, b) => a.angle - b.angle);
  const times = staggerTimes(raw.length, PHASE_1.from + 0.9, PHASE_1.from + 2.1);
  return raw.map((post, index) => ({ position: post.position, revealAt: times[index]! }));
}

export type EntranceBlock = { position: Vec3; size: Vec3; revealAt: number };

export function buildEntranceBlocks(): EntranceBlock[] {
  const z = -PLAZA_HALF + 0.55;
  const times = staggerTimes(2, PHASE_1.from + 1.7, PHASE_1.to);
  return [
    { position: [0, 0.35, z], size: [1.9, 0.7, 0.9], revealAt: times[0]! },
    { position: [0, 0.85, z], size: [1.5, 0.3, 0.9], revealAt: times[1]! },
  ];
}

export type MobileCraneLayout = {
  restPosition: Vec3;
  startOffsetX: number;
  bodyRevealAt: number;
  outriggerRevealAt: number;
  outriggers: Vec3[]; // local offsets from restPosition
};

export function buildMobileCrane(): MobileCraneLayout {
  const restPosition: Vec3 = [-3.0, 0, 2.5];
  return {
    restPosition,
    startOffsetX: -9.5,
    bodyRevealAt: PHASE_1.from + 1.5,
    outriggerRevealAt: PHASE_1.from + 2.15,
    outriggers: [
      [0.85, 0, 0.6],
      [0.85, 0, -0.6],
      [-0.85, 0, 0.6],
      [-0.85, 0, -0.6],
    ],
  };
}

// ---- Phase 02 · Glazed podium, floor 01–25 -------------------------------

export type PodiumChunk = {
  index: number;
  y0: number;
  y1: number;
  floors: number;
  revealAt: number;
};

export function buildPodiumChunks(): PodiumChunk[] {
  const floorsPerChunk = PODIUM_FLOORS / PODIUM_CHUNK_COUNT;
  const times = staggerTimes(PODIUM_CHUNK_COUNT, PHASE_2.from, PHASE_2.to - 0.6);
  return Array.from({ length: PODIUM_CHUNK_COUNT }, (_, index) => {
    const y0 = index * floorsPerChunk * FLOOR_HEIGHT;
    const y1 = y0 + floorsPerChunk * FLOOR_HEIGHT;
    return { index, y0, y1, floors: floorsPerChunk, revealAt: times[index]! };
  });
}

// ---- Phase 03 · Steel frame, floor 26–40 ---------------------------------

export type SteelChunk = {
  index: number;
  y0: number;
  y1: number;
  floors: number;
  revealAt: number;
  hasNet: boolean;
  hasDeck: boolean;
};

export function buildSteelChunks(): SteelChunk[] {
  const floorsPerChunk = STEEL_FLOORS / STEEL_CHUNK_COUNT;
  const times = staggerTimes(STEEL_CHUNK_COUNT, PHASE_3.from, PHASE_3.to - 0.7);
  return Array.from({ length: STEEL_CHUNK_COUNT }, (_, index) => {
    const y0 = PODIUM_TOP_Y + index * floorsPerChunk * FLOOR_HEIGHT;
    const y1 = y0 + floorsPerChunk * FLOOR_HEIGHT;
    return {
      index,
      y0,
      y1,
      floors: floorsPerChunk,
      revealAt: times[index]!,
      hasNet: index >= STEEL_CHUNK_COUNT - 2,
      hasDeck: index === STEEL_CHUNK_COUNT - 1,
    };
  });
}

// ---- Phase 04 · Tower crane deployment -----------------------------------

export type TowerCraneLayout = {
  base: Vec3;
  sectionHeight: number;
  sectionCount: number;
  sectionRevealAt: number[];
  cabRevealAt: number;
  jibRevealAt: number;
  jibLength: number;
  counterJibLength: number;
  mastTopY: number;
};

export function buildTowerCrane(): TowerCraneLayout {
  const base: Vec3 = [TOWER_HALF + 1.5, 0, -0.6];
  const sectionCount = 8;
  const mastTopY = ROOF_Y + 3.6;
  const sectionHeight = mastTopY / sectionCount;
  const sectionRevealAt = staggerTimes(sectionCount, PHASE_4.from, PHASE_4.from + 2.0);
  return {
    base,
    sectionHeight,
    sectionCount,
    sectionRevealAt,
    cabRevealAt: PHASE_4.from + 2.2,
    jibRevealAt: PHASE_4.from + 2.8,
    jibLength: 3.6,
    counterJibLength: 1.35,
    mastTopY,
  };
}

// ---- Phase 05 · Personnel & IoT activation -------------------------------

export type WorkerSpec = { id: string; position: Vec3; revealAt: number };

export function buildWorkers(): WorkerSpec[] {
  // Formwork deck (see `hasDeck` in `buildSteelChunks`) is 0.16 thick and
  // sits with its base at ROOF_Y, so its walkable top face is ROOF_Y + 0.16.
  const deckTopY = ROOF_Y + 0.16;
  const positions: Vec3[] = [
    [0.3, GROUND_Y, -3.3],
    [-2.1, GROUND_Y, 1.7],
    [1.7, GROUND_Y, -0.6],
    [-1.5, GROUND_Y, -1.6],
    [0.8, deckTopY, -0.5],
    [-0.6, deckTopY, 0.4],
  ];
  const times = staggerTimes(positions.length, PHASE_5.from, PHASE_5.from + 1.3);
  return positions.map((position, index) => ({
    id: `worker-${index}`,
    position,
    revealAt: times[index]!,
  }));
}

export type IotMarkerSpec = {
  id: string;
  code: string;
  label: string;
  position: Vec3;
  revealAt: number;
};

export function buildIotMarkers(): IotMarkerSpec[] {
  const specs: Array<Omit<IotMarkerSpec, "revealAt">> = [
    { id: "sensor-01", code: "SENSOR 01", label: "TILT · OK", position: [TOWER_HALF + 0.65, 1.1, -0.7] },
    { id: "sensor-02", code: "SENSOR 02", label: "VIBRATION", position: [TOWER_HALF + 0.12, PODIUM_TOP_Y * 0.55, 0.6] },
    { id: "sensor-03", code: "SENSOR 03", label: "CO₂ · AIR", position: [0.55, ROOF_Y + 0.85, -0.3] },
  ];
  const times = staggerTimes(specs.length, PHASE_5.from + 1.1, PHASE_5.to);
  return specs.map((spec, index) => ({ ...spec, revealAt: times[index]! }));
}
