"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import type { OrthographicCamera as OrthographicCameraImpl } from "three";
import BuildingAssemblyModel from "@/components/voxel-site/BuildingAssemblyModel";
import { voxelSitePalette as palette } from "@/scene/voxel-site/palette";
import type { TimelineStore } from "@/scene/voxel-site/timeline";

type VoxelSiteCanvasProps = {
  store: TimelineStore;
  onUnavailable: () => void;
};

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Dynamically imported by `VoxelSiteStage` with `ssr: false` — this file is
 * the only place `three` / `@react-three/fiber` get evaluated.
 */
export default function VoxelSiteCanvas({ store, onUnavailable }: VoxelSiteCanvasProps) {
  const [available] = useState(canUseWebGL);

  useEffect(() => {
    if (!available) onUnavailable();
  }, [available, onUnavailable]);

  if (!available) return null;

  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true }} shadows="soft" flat aria-hidden="true">
      <color attach="background" args={[palette.paper]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={2}
        shadow-camera-far={40}
      />
      {/* Fixed isometric orthographic rig — no user orbit/zoom/pan. */}
      <OrthographicCamera
        makeDefault
        position={[30, 25, 30]}
        zoom={40}
        near={0.1}
        far={200}
        onUpdate={(self: OrthographicCameraImpl) => self.lookAt(0, 6, 0)}
      />
      <BuildingAssemblyModel store={store} />
    </Canvas>
  );
}
