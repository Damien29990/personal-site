"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { PhaseController } from "@/components/voxel-site/PhaseController";
import { createTimelineStore, type TimelineStore } from "@/scene/voxel-site/timeline";

const VoxelSiteCanvas = dynamic(() => import("./VoxelSiteCanvas"), {
  ssr: false,
  loading: () => <div className="blueprint-grid h-full w-full" aria-hidden="true" />,
});

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Client wrapper: owns the timeline store, `prefers-reduced-motion` /
 * tab-visibility / in-view gating, and lays out the canvas + HUD together.
 * `VoxelSiteCanvas` (three.js) only ever loads client-side.
 */
export function VoxelSiteStage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

  const [manualPlaying, setManualPlaying] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [inView, setInView] = useState(true);

  // `useSyncExternalStore` resolves to `false` on the server and corrects to
  // the real value before the first paint on the client — no flash of the
  // build animation for a reduced-motion visitor, and no manual effect.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const store = useMemo<TimelineStore>(() => createTimelineStore({ reducedMotion }), [reducedMotion]);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), {
      threshold: 0.12,
    });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  // A single source of truth for "should the clock advance": the user's own
  // pause/play intent, gated by tab visibility and scroll position.
  useEffect(() => {
    store.setPlaying(manualPlaying && tabVisible && inView);
  }, [store, manualPlaying, tabVisible, inView]);

  const handleTogglePlaying = useCallback(() => setManualPlaying((value) => !value), []);
  const handleReplay = useCallback(() => {
    store.replay();
    setManualPlaying(true);
  }, [store]);
  const handleJumpToPhase = useCallback(
    (index: number) => {
      store.jumpToPhase(index);
      setManualPlaying(true);
    },
    [store],
  );

  return (
    <div
      ref={hostRef}
      className="artifact-stage relative h-[68vh] min-h-[440px] w-full overflow-hidden border border-fg"
    >
      {!webglAvailable ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.18em] text-accent">DY-LAB-002</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            This browser can&rsquo;t render the WebGL model. The 40F assembly sequence needs a modern desktop or
            mobile browser with WebGL enabled.
          </p>
        </div>
      ) : (
        <>
          <VoxelSiteCanvas store={store} onUnavailable={() => setWebglAvailable(false)} />
          <PhaseController
            store={store}
            onTogglePlaying={handleTogglePlaying}
            onReplay={handleReplay}
            onJumpToPhase={handleJumpToPhase}
          />
        </>
      )}
    </div>
  );
}
