import { InstancedMesh, Object3D } from "three";
import { backOut, clamp01 } from "@/scene/voxel-site/easing";

const dummy = new Object3D();

export type InstancedPart = {
  position: readonly [number, number, number];
  revealAt: number;
};

/**
 * Writes every instance's matrix for the given reveal time, in place.
 * Parts pop with a back-out overshoot and a small drop from above instead of
 * a linear fade — and clear instantly once `revealSeconds` drops back below
 * their `revealAt` (a "clean" hide, which reads fine for many small
 * identical tiles). Cheap enough to run for the whole set every frame; these
 * groups are in the low hundreds of instances at most.
 */
export function applyInstancedReveal(
  mesh: InstancedMesh,
  parts: readonly InstancedPart[],
  revealSeconds: number,
  popSeconds: number,
  dropHeight: number,
): void {
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]!;
    const t = clamp01((revealSeconds - part.revealAt) / popSeconds);
    const eased = backOut(t);
    dummy.position.set(
      part.position[0],
      part.position[1] + (1 - eased) * dropHeight,
      part.position[2],
    );
    dummy.scale.setScalar(Math.max(eased, 0));
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}
