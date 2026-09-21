"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { withBasePath } from "@/lib/paths";
import { site } from "@/content/site";

type Drag = {
  x: number;
  time: number;
  moved: boolean;
};

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Shown when WebGL is unavailable or motion is reduced. */
export function SiteLoopVideo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const resumeRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    if (!host || !video) return;

    let inView = true;

    const shouldPlay = () =>
      inView && document.visibilityState !== "hidden" && !prefersReduced();

    const sync = () => {
      if (shouldPlay()) void video.play().catch(() => undefined);
      else video.pause();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: 0.2 },
    );
    io.observe(host);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      io.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const scrub = (clientX: number) => {
    const drag = dragRef.current;
    const video = videoRef.current;
    const width = hostRef.current?.clientWidth ?? 1;
    if (!drag || !video || !video.duration) return;

    const delta = clientX - drag.x;
    if (Math.abs(delta) > 3) drag.moved = true;

    const span = video.duration;
    const next = drag.time + (delta / width) * span;
    video.currentTime = ((next % span) + span) % span;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    resumeRef.current = !video.paused;
    dragRef.current = { x: event.clientX, time: video.currentTime, moved: false };
    video.pause();
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current) scrub(event.clientX);
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    const video = videoRef.current;
    dragRef.current = null;
    if (!video) return;

    if (!drag?.moved) {
      if (video.paused) void video.play().catch(() => undefined);
      else video.pause();
      return;
    }

    if (resumeRef.current && !prefersReduced()) {
      void video.play().catch(() => undefined);
    }
  };

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  };

  const step = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.pause();
    const next = video.currentTime + seconds;
    video.currentTime = ((next % video.duration) + video.duration) % video.duration;
  };

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
        {failed ? (
          <p className="flex h-full items-end p-4 text-sm leading-relaxed text-muted">
            {site.heroLoop.fallback}
          </p>
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={withBasePath(site.heroLoop.src)}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={site.heroLoop.caption}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
            onLoadedMetadata={(event) => {
              if (prefersReduced()) event.currentTarget.currentTime = 0.05;
            }}
          />
        )}

        <p className="pointer-events-none absolute top-3 left-3 font-display text-[10px] uppercase tracking-[0.16em] text-accent">
          <span className="mb-1 block h-px w-8 bg-accent" aria-hidden="true" />
          {site.heroLoop.hint}
        </p>

        {failed ? null : (
          <button
            type="button"
            onClick={toggle}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                step(0.5);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                step(-0.5);
              }
            }}
            className="absolute right-3 bottom-3 min-h-9 border border-fg bg-bg px-3 font-display text-[10px] uppercase tracking-[0.16em]"
          >
            {playing ? "Hold" : "Run"}
          </button>
        )}
      </div>
      <figcaption className="mt-3 font-display text-[10px] uppercase tracking-[0.16em] text-muted">
        {site.heroLoop.caption}
      </figcaption>
    </figure>
  );
}
