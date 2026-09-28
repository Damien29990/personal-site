import { clamp01, easeInOutCubic } from "@/scene/voxel-site/easing";

/**
 * Timeline for the 40F smart-site assembly lab.
 * Pure state machine — no React, no three.js. `createTimelineStore` is the
 * single source of truth that both the R3F scene (`BuildingAssemblyModel`)
 * and the DOM overlay (`PhaseController`) read from.
 *
 * Clock shape, one full loop = CYCLE_SECONDS:
 *
 *   0 ────────────── BUILD_SECONDS ──── +HOLD ──── +TEARDOWN (= CYCLE)
 *   |  assembling 5 phases forward  |  hold  |  fast clean rewind  |
 *
 * `reveal` is what parts actually key off: it rises 0→BUILD_SECONDS while
 * assembling, plateaus during the hold, then eases back to 0 during
 * teardown — so "hide the last thing built first" falls out for free.
 */

export type PhaseMeta = {
  /** 1-based index for display, e.g. "01/05". */
  id: number;
  code: string;
  title: string;
  from: number;
  to: number;
};

export const PHASES: readonly PhaseMeta[] = [
  { id: 1, code: "01/05", title: "GROUND & FOUNDATION", from: 0, to: 3.0 },
  { id: 2, code: "02/05", title: "GLAZED PODIUM · FLOOR 01–25", from: 3.0, to: 7.6 },
  { id: 3, code: "03/05", title: "STEEL FRAME ASSEMBLY · FLOOR 26–40", from: 7.6, to: 11.8 },
  { id: 4, code: "04/05", title: "TOWER CRANE DEPLOYMENT", from: 11.8, to: 15.4 },
  { id: 5, code: "05/05", title: "PERSONNEL & IOT ACTIVATION", from: 15.4, to: 18.0 },
] as const;

export const BUILD_SECONDS = PHASES[PHASES.length - 1]!.to;
export const HOLD_SECONDS = 3.5;
export const TEARDOWN_SECONDS = 6.5;
export const CYCLE_SECONDS = BUILD_SECONDS + HOLD_SECONDS + TEARDOWN_SECONDS;

export type Segment = "build" | "hold" | "teardown";

export function wrapTime(seconds: number): number {
  return ((seconds % CYCLE_SECONDS) + CYCLE_SECONDS) % CYCLE_SECONDS;
}

export function segmentAt(elapsed: number): Segment {
  const t = wrapTime(elapsed);
  if (t < BUILD_SECONDS) return "build";
  if (t < BUILD_SECONDS + HOLD_SECONDS) return "hold";
  return "teardown";
}

/** Build progress in seconds, 0..BUILD_SECONDS. See module doc for the shape. */
export function revealAt(elapsed: number): number {
  const t = wrapTime(elapsed);
  if (t < BUILD_SECONDS) return t;
  if (t < BUILD_SECONDS + HOLD_SECONDS) return BUILD_SECONDS;
  const progress = (t - BUILD_SECONDS - HOLD_SECONDS) / TEARDOWN_SECONDS;
  return BUILD_SECONDS * (1 - easeInOutCubic(progress));
}

export function phaseIndexAt(reveal: number): number {
  for (let index = PHASES.length - 1; index >= 0; index -= 1) {
    if (reveal >= PHASES[index]!.from) return index;
  }
  return 0;
}

export function phaseProgressAt(reveal: number, phaseIndex: number): number {
  const phase = PHASES[phaseIndex];
  if (!phase) return 0;
  const span = phase.to - phase.from;
  if (span <= 0) return 1;
  return clamp01((reveal - phase.from) / span);
}

export type TimelineSnapshot = {
  elapsed: number;
  reveal: number;
  phaseIndex: number;
  phaseProgress: number;
  segment: Segment;
  playing: boolean;
  /** True while the model is fully assembled and holding (the "showcase" moment). */
  complete: boolean;
  /** Increments whenever `elapsed` is set discontinuously (replay / phase jump). */
  jumpToken: number;
};

export type TimelineStore = {
  /** Advances the clock by `delta` seconds (when playing) and returns the new snapshot. */
  tick: (delta: number) => TimelineSnapshot;
  getSnapshot: () => TimelineSnapshot;
  /** Fires on every `tick()` call — cheap consumers read the snapshot directly. */
  onTick: (listener: (snapshot: TimelineSnapshot) => void) => () => void;
  setPlaying: (next: boolean) => void;
  togglePlaying: () => void;
  /** Jump to the very start of the build and play forward. */
  replay: () => void;
  /** Jump to the start of a given phase (0-based) and play forward. */
  jumpToPhase: (index: number) => void;
};

const MAX_DELTA = 0.25;
const COMPLETE_EPSILON = 1e-3;

export function createTimelineStore(options: { reducedMotion?: boolean } = {}): TimelineStore {
  let elapsed = options.reducedMotion ? BUILD_SECONDS : 0;
  let playing = !options.reducedMotion;
  let jumpToken = options.reducedMotion ? 1 : 0;

  const listeners = new Set<(snapshot: TimelineSnapshot) => void>();

  const computeSnapshot = (): TimelineSnapshot => {
    const reveal = revealAt(elapsed);
    const segment = segmentAt(elapsed);
    const phaseIndex = phaseIndexAt(reveal);
    return {
      elapsed,
      reveal,
      phaseIndex,
      phaseProgress: phaseProgressAt(reveal, phaseIndex),
      segment,
      playing,
      complete: segment !== "build" && reveal >= BUILD_SECONDS - COMPLETE_EPSILON,
      jumpToken,
    };
  };

  let snapshot = computeSnapshot();

  const emit = (): TimelineSnapshot => {
    snapshot = computeSnapshot();
    for (const listener of listeners) listener(snapshot);
    return snapshot;
  };

  const jumpTo = (seconds: number) => {
    elapsed = wrapTime(seconds);
    playing = true;
    jumpToken += 1;
  };

  return {
    tick(delta) {
      if (playing) elapsed = wrapTime(elapsed + Math.min(Math.max(delta, 0), MAX_DELTA));
      return emit();
    },
    getSnapshot: () => snapshot,
    onTick(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setPlaying(next) {
      playing = next;
      emit();
    },
    togglePlaying() {
      playing = !playing;
      emit();
    },
    replay() {
      jumpTo(0);
      emit();
    },
    jumpToPhase(index) {
      const bounded = Math.min(Math.max(index, 0), PHASES.length - 1);
      jumpTo(PHASES[bounded]!.from);
      emit();
    },
  };
}
