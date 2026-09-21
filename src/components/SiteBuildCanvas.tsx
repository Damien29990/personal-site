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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onUnavailable();
      return;
    }

    const handle = createSiteScene(host);
    if (!handle) {
      onUnavailable();
      return;
    }

    onReady(handle);
    return () => handle.dispose();
  }, [onReady, onUnavailable]);

  return <div ref={hostRef} className="h-full w-full" aria-hidden="true" />;
}
