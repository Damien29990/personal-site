"use client";

import { useEffect, useRef } from "react";
import { createSiteScene, type SiteSceneHandle } from "@/scene/createSiteScene";

type SiteBuildCanvasProps = {
  onReady: (handle: SiteSceneHandle) => void;
  onUnavailable: () => void;
};

export default function SiteBuildCanvas({ onReady, onUnavailable }: SiteBuildCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let handle: SiteSceneHandle | null = null;
    let cancelled = false;

    void createSiteScene(host)
      .then((next) => {
        if (cancelled) {
          next?.dispose();
          return;
        }
        if (!next) {
          onUnavailable();
          return;
        }
        handle = next;
        onReady(next);
      })
      .catch(() => {
        if (!cancelled) onUnavailable();
      });

    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, [onReady, onUnavailable]);

  return <div ref={hostRef} className="h-full w-full" aria-hidden="true" />;
}
