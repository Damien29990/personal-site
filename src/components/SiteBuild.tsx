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
  y: number;
  yaw: number;
  pitch: number;
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
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);

  const [stageIndex, setStageIndex] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null);

  const onReady = useCallback((handle: SiteSceneHandle) => {
    handleRef.current = handle;
    setAvailable(true);

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

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onWheel = (event: WheelEvent) => {
      const handle = handleRef.current;
      if (!handle) return;
      event.preventDefault();
      const next = handle.getZoom() * (event.deltaY > 0 ? 0.92 : 1.08);
      handle.setZoom(next);
    };

    host.addEventListener("wheel", onWheel, { passive: false });
    return () => host.removeEventListener("wheel", onWheel);
  }, [available]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const handle = handleRef.current;
    if (!handle) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 1) {
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        yaw: handle.getYaw(),
        pitch: handle.getPitch(),
      };
      pinchRef.current = null;
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const handle = handleRef.current;
    if (!handle || !pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const points = [...pointersRef.current.values()];
    if (points.length >= 2) {
      const first = points[0];
      const second = points[1];
      if (!first || !second) return;
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      const pinch = pinchRef.current;
      if (!pinch) {
        pinchRef.current = { distance, zoom: handle.getZoom() };
        return;
      }
      if (pinch.distance > 0) handle.setZoom(pinch.zoom * (distance / pinch.distance));
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;
    const width = hostRef.current?.clientWidth ?? 1;
    const height = hostRef.current?.clientHeight ?? 1;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    handle.setYaw(drag.yaw + (dx / width) * Math.PI * 2);
    handle.setPitch(drag.pitch - (dy / height) * 1.1);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    if (pointersRef.current.size === 0) dragRef.current = null;
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
        className="artifact-stage relative aspect-video w-full cursor-grab touch-none select-none overflow-hidden border border-fg active:cursor-grabbing"
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
          {`00:00 / 01:33`}
        </span>

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
