---
name: threejs-voxel-animation
description: Build pixel-snapped Three.js voxel dioramas for this personal site — construction-site + IoT scenes, Next.js client islands, orthographic cameras, InstancedMesh, and restrained loops. Use when the user mentions Three.js, WebGL, voxel, pixel 3D, isometric diorama, construction site model, IoT sensors in 3D, Hero canvas, animation, or 3D modelling for the site.
---

# Three.js voxel animation

Use this skill whenever adding or changing WebGL on this site. UI stays React + Tailwind. 3D lives in a dedicated client island, never as page chrome.

## When to use Three.js

Use it for a **Hero work-artifact diorama** that shows ConTech identity (site, sensors, crane, deck).

Do not use it for particle fields, full-page backgrounds, Spline blobs, custom cursors, scroll-jacking, sound, or orbit/zoom controls.

If CSS `transform`/`opacity` can do the job, do not open WebGL.

## Next.js wiring

This repo is App Router (Next.js 16). WebGL cannot SSR.

1. Keep the page / `Hero` a Server Component.
2. Export a small `'use client'` wrapper that calls `next/dynamic` with `{ ssr: false }`.
3. Put `WebGLRenderer` and `import("three")` only in the dynamically loaded canvas file.

`ssr: false` is **not** allowed in Server Components. The `dynamic()` call must live in a Client Component.

```tsx
"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./SiteDioramaCanvas"), {
  ssr: false,
  loading: () => <div className="h-full bg-surface" aria-hidden />,
});
```

Default-export the canvas module. Mark the canvas decorative: `aria-hidden="true"`. Identity, proof, and CTA stay in HTML, not in the GL scene.

## Visual language

**Isometric voxel diorama**, not Minecraft fan art and not a CAD screenshot.

- Unit cubes (~0.92 scale so a hairline gap reads as voxels)
- Orthographic camera, pixel-snapped position
- Solid `MeshLambertMaterial` colors from the site tokens — no textures unless a real asset exists
- Warm paper clear color (`--color-bg`), one amber accent (`--color-accent`)
- Narrative limited to **construction site × IoT**: incomplete building, scaffold, tower crane, site cabin/gateway, sensor pulses, data hops to the gateway
- No hero character, no sci-fi city, no floating logos

Scene code: imperative Three.js + `InstancedMesh`. Do not add `@react-three/fiber`, `drei`, or postprocessing.

## Animation etiquette

Treat motion as a silent loop, like a physical model on a turntable.

- Camera: 40–60s loop as a small isometric yaw sway. No user orbit, pan, or zoom. A full 360 is allowed only if the model stays inside the frame.
- Crane boom: slow rotation. Sensors: staggered `emissiveIntensity`. Packets: lerp along paths.
- Animate only transforms, emissive intensity, and camera. No scroll hijack.
- `prefers-reduced-motion: reduce` → render **one** frame, then stop.
- `IntersectionObserver`: pause `requestAnimationFrame` when the host leaves the viewport.
- `visibilitychange`: pause when the tab is hidden.
- Cap `devicePixelRatio` at `1.5`.
- If WebGL is missing, show a paper surface and one sentence from `src/content/site.ts`. Never a blank hole.

## Modelling rules

- Prefer integer grid cells, then offset by `0.5` for cube centers.
- One `InstancedMesh` per material. Individual meshes only for things that animate independently (sensors, packets, boom group).
- Keep draw cost low: hundreds of instances, not thousands of `Mesh`es, no GLTF.
- Dispose geometries, materials, renderer, observers, and rAF on unmount.
- Resize with `ResizeObserver` on the host, not `window` alone.

## File map (this repo)

- `src/components/SiteDiorama.tsx` — client wrapper + `dynamic`
- `src/components/SiteDioramaCanvas.tsx` — host, fallback, lifecycle
- `src/scene/createSiteScene.ts` — camera, lights, layout, loop
- `src/scene/voxels.ts` — grid helpers + instancing
- `src/scene/palette.ts` — token colors + Lambert materials

Copy and captions for the diorama live in `src/content/site.ts`. Do not hardcode the owner's bio in the scene.

## Quality bar

- Recruiter can read name, identity, and CTA in 10 seconds with the canvas running
- Mobile: canvas **below** the copy, short height; desktop: right column
- Reduced-motion still shows a complete still
- Leaving the Hero stops the loop

## Additional resources

- Camera, instancing, IoT pulse, crane: [reference.md](reference.md)
- Wiring pattern used on this site: [examples.md](examples.md)
