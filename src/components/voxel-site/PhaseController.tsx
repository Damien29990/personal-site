"use client";

import { useEffect, useRef, useState } from "react";
import { BUILD_SECONDS, PHASES, type Segment, type TimelineStore } from "@/scene/voxel-site/timeline";

type PhaseControllerProps = {
  store: TimelineStore;
  onTogglePlaying: () => void;
  onReplay: () => void;
  onJumpToPhase: (index: number) => void;
};

const SEGMENT_LABEL: Record<Segment, string> = {
  build: "ASSEMBLING",
  hold: "HOLDING",
  teardown: "REWINDING",
};

/**
 * Hard-edge, engineering-drawing-style HUD over the canvas: current phase,
 * a build/hold/rewind status word, quick phase-jump tabs, and transport
 * controls. Mirrors the progress-bar-as-ref idiom from `SiteBuild` so the
 * bar can update every tick without re-rendering React.
 */
export function PhaseController({ store, onTogglePlaying, onReplay, onJumpToPhase }: PhaseControllerProps) {
  const barRef = useRef<HTMLSpanElement>(null);
  const [phaseIndex, setPhaseIndex] = useState(() => store.getSnapshot().phaseIndex);
  const [segment, setSegment] = useState<Segment>(() => store.getSnapshot().segment);
  const [playing, setPlaying] = useState(() => store.getSnapshot().playing);

  useEffect(
    () =>
      store.onTick((snapshot) => {
        const bar = barRef.current;
        if (bar) bar.style.transform = `scaleX(${snapshot.reveal / BUILD_SECONDS})`;
        setPhaseIndex(snapshot.phaseIndex);
        setSegment(snapshot.segment);
        setPlaying(snapshot.playing);
      }),
    [store],
  );

  const phase = PHASES[phaseIndex];

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      <p className="absolute top-3 left-3 max-w-[70%] font-display text-[10px] uppercase tracking-[0.16em] text-accent">
        <span className="mb-1 block h-px w-8 bg-accent" aria-hidden="true" />
        {`PHASE: ${phase?.code ?? "00/05"} - ${phase?.title ?? ""}`}
      </p>

      <p className="absolute top-3 right-3 font-display text-[10px] uppercase tracking-[0.16em] text-muted">
        {SEGMENT_LABEL[segment]}
      </p>

      <div className="pointer-events-auto absolute bottom-4 left-3 flex items-center gap-1">
        {PHASES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onJumpToPhase(index)}
            aria-current={index === phaseIndex ? "step" : undefined}
            aria-label={`Jump to phase ${item.code} — ${item.title}`}
            className={`flex h-6 w-6 items-center justify-center border font-display text-[9px] uppercase tracking-[0.1em] transition-colors duration-200 ${
              index === phaseIndex
                ? "border-accent bg-accent text-accent-fg"
                : "border-fg bg-bg text-muted hover:text-fg"
            }`}
          >
            {String(item.id).padStart(2, "0")}
          </button>
        ))}
      </div>

      <div className="pointer-events-auto absolute right-3 bottom-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onReplay}
          className="min-h-9 border border-fg bg-bg px-3 font-display text-[10px] uppercase tracking-[0.16em] hover:bg-surface"
        >
          [REPLAY]
        </button>
        <button
          type="button"
          onClick={onTogglePlaying}
          className="min-h-9 border border-fg bg-bg px-3 font-display text-[10px] uppercase tracking-[0.16em] hover:bg-surface"
        >
          {playing ? "[PAUSE]" : "[PLAY]"}
        </button>
      </div>

      <span className="absolute bottom-0 left-0 h-[3px] w-full bg-line" aria-hidden="true">
        <span ref={barRef} className="block h-full w-full origin-left scale-x-0 bg-accent" />
      </span>
    </div>
  );
}
