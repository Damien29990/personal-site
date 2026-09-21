# Voxel diorama reference

## Palette

Match [`src/app/globals.css`](../../../src/app/globals.css) tokens. Do not introduce purple neon or cool gray steel.

| Token | Role in 3D |
| --- | --- |
| `--color-bg` | `renderer.setClearColor` (paper) |
| `--color-accent` | crane cab, sensor emissive, data hops |
| `--color-fg` | unused in mesh (text stays HTML) |
| `--color-line` | fence / scaffold desaturate |

`NoToneMapping`. Lambert + hemisphere (paper sky, sand ground) + one warm directional light. No shadows.

## Orthographic camera + pixel snap

```ts
const frustum = 20;
const aspect = width / Math.max(height, 1);
camera.left = (-frustum * aspect) / 2;
camera.right = (frustum * aspect) / 2;
camera.top = frustum / 2;
camera.bottom = -frustum / 2;
camera.updateProjectionMatrix();

const worldPerPixel = (camera.top - camera.bottom) / Math.max(height, 1);
camera.position.x = Math.round(camera.position.x / worldPerPixel) * worldPerPixel;
camera.position.y = Math.round(camera.position.y / worldPerPixel) * worldPerPixel;
camera.position.z = Math.round(camera.position.z / worldPerPixel) * worldPerPixel;
```

Orbit: keep Y fixed, yaw XZ around a look-at near the building centroid (`y ≈ 3.3`). Prefer a 48s sine sway (~±0.4 rad) around the isometric angle so the site stays readable. A full 360 orbit clips the crane at side angles.

`renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`.

## InstancedMesh

```ts
const mesh = new InstancedMesh(new BoxGeometry(0.92, 0.92, 0.92), material, cells.length);
const dummy = new Object3D();
cells.forEach((cell, i) => {
  dummy.position.set(cell[0] + 0.5, cell[1] + 0.5, cell[2] + 0.5);
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
});
mesh.instanceMatrix.needsUpdate = true;
```

Integer `cell` is the voxel's min corner. One mesh per material.

## Crane

- Mast: vertical stack, parented to a static `Group` at the mast footprint
- Boom + counterweight + cab: child `Group` at mast top; rotate `boom.rotation.y`
- Hook: child of boom, bob `position.y` with a slow sine — do not spin independently

## IoT pulse

Each sensor is its own `Mesh` (not instanced) so emissive can stagger:

```ts
mat.emissive.set(accent);
mat.emissiveIntensity = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 2 + offset));
```

Data hops: `QuadraticBezierCurve3` from sensor to cabin roof. A small accent cube, `u = (t * speed + offset) % 1`.

## Pause / dispose

```ts
const animate = visible && inView && !reducedMotion && !hidden;
```

On dispose: `cancelAnimationFrame`, observer disconnect, `visibilitychange` off, traverse `geometry.dispose()` / `material.dispose()`, `renderer.dispose()`, remove `domElement`.
