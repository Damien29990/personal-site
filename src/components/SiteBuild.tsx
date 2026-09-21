"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SiteLoopVideo } from "@/components/SiteLoopVideo";
import { site } from "@/content/site";
import type { SiteSceneHandle } from "@/scene/createSiteScene";
import { STAGES } from "@/scene/schedule";

const SiteBuildCanvas = dynamic(() => import("./SiteBuildCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface" aria-hidden />,
});

type Drag = {
  x: number;
  time: number;
  moved: boolean;
};

function clock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function SiteBuild() {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SiteSceneHandle | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const resumeRef = useRef(true);

  const [stageIndex, setStageIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const [available, setAvailable] = useState<boolean | null>(null);

  const onReady = useCallback((handle: SiteSceneHandle) => {
    handleRef.current = handle;
    setAvailable(true);
    setRunning(handle.isRunning());

    unsubscribeRef.current?.();
    unsubscribeRef.current = handle.onTick((seconds, stage) => {
      const bar = barRef.current;
      if (bar) bar.style.transform = `scaleX(${seconds / handle.duration})`;

      const label = timeRef.current;
      if (label) label.textContent = `${clock(seconds)} / ${clock(handle.duration)}`;

      setStageIndex(stage);
    });
  }, []);

  const onUnavailable = useCallback(() => setAvailable(false), []);

  useEffect(
    () => () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      handleRef.current = null;
    },
    [],
  );

  const run = (next: boolean) => {
    handleRef.current?.setRunning(next);
    setRunning(next);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const handle = handleRef.current;
    if (!handle) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    resumeRef.current = handle.isRunning();
    dragRef.current = { x: event.clientX, time: handle.getTime(), moved: false };
    run(false);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const handle = handleRef.current;
    if (!drag || !handle) return;

    const width = hostRef.current?.clientWidth ?? 1;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 3) drag.moved = true;
    handle.setTime(drag.time + (delta / width) * handle.duration);
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!handleRef.current) return;

    // A press with no travel is a click, so it toggles the pre-drag state.
    run(drag?.moved ? resumeRef.current : !resumeRef.current);
  };

  const step = (seconds: number) => {
    const handle = handleRef.current;
    if (!handle) return;
    run(false);
    handle.setTime(handle.getTime() + seconds);
  };

  if (available === false) {
    return <SiteLoopVideo />;
  }

  const stage = STAGES[stageIndex];

  return (
    <figure className="m-0">
      <div
        ref={hostRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="artifact-stage relative aspect-video w-full cursor-grab touch-pan-y select-none overflow-hidden border border-fg active:cursor-grabbing"
      >
        <div className="absolute inset-0">
          <SiteBuildCanvas onReady={onReady} onUnavailable={onUnavailable} />
        </div>

        <p className="pointer-events-none absolute top-3 left-3 font-display text-[10px] uppercase tracking-[0.16em] text-accent">
          <span className="mb-1 block h-px w-8 bg-accent" aria-hidden="true" />
          {site.heroBuild.hint}
        </p>

        <p className="pointer-events-none absolute top-3 right-3 text-right font-display text-[10px] uppercase tracking-[0.16em] text-muted">
          {`${String(stageIndex + 1).padStart(2, "0")} / ${stage?.label ?? ""}`}
        </p>

        <span
          ref={timeRef}
          className="pointer-events-none absolute bottom-4 left-3 font-display text-[10px] uppercase tracking-[0.16em] text-muted"
        >
          {`00:00 / 01:00`}
        </span>

        <button
          type="button"
          onClick={() => run(!running)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              step(1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              step(-1);
            }
          }}
          className="absolute right-3 bottom-4 min-h-9 border border-fg bg-bg px-3 font-display text-[10px] uppercase tracking-[0.16em]"
        >
          {running ? "Hold" : "Run"}
        </button>

        <span
          className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full bg-line"
          aria-hidden="true"
        >
          <span ref={barRef} className="block h-full w-full origin-left scale-x-0 bg-accent" />
        </span>
      </div>
      <figcaption className="mt-3 font-display text-[10px] uppercase tracking-[0.16em] text-muted">
        {site.heroBuild.caption}
      </figcaption>
    </figure>
  );
}
