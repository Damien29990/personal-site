import { BoxGeometry, InstancedMesh, MeshLambertMaterial, Object3D } from "three";

export type Cell = readonly [number, number, number];

export type TimedCell = {
  cell: Cell;
  at: number;
};

export type TimedCubes = {
  mesh: InstancedMesh;
  update: (revealSeconds: number) => void;
};

const POP_SECONDS = 0.35;
const DROP_HEIGHT = 0.8;

export function pushFill(
  out: Cell[],
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  skip?: (x: number, y: number, z: number) => boolean,
): void {
  for (let x = x0; x <= x1; x += 1) {
    for (let y = y0; y <= y1; y += 1) {
      for (let z = z0; z <= z1; z += 1) {
        if (skip?.(x, y, z)) continue;
        out.push([x, y, z]);
      }
    }
  }
}

export function pushRing(
  out: Cell[],
  x0: number,
  x1: number,
  y: number,
  z0: number,
  z1: number,
  skip?: (x: number, z: number) => boolean,
): void {
  for (let x = x0; x <= x1; x += 1) {
    for (let z = z0; z <= z1; z += 1) {
      const edge = x === x0 || x === x1 || z === z0 || z === z1;
      if (edge && !skip?.(x, z)) out.push([x, y, z]);
    }
  }
}

/** Number of cells placed at or before `seconds`. Cells must be sorted by `at`. */
function placedCount(cells: readonly TimedCell[], seconds: number): number {
  let low = 0;
  let high = cells.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (cells[mid]!.at <= seconds) low = mid + 1;
    else high = mid;
  }
  return low;
}

/**
 * One InstancedMesh whose blocks appear on a schedule. Reveal is driven by
 * `count`, so only the handful of blocks still dropping need a matrix rewrite.
 * Reading the state from a single time value keeps scrubbing reversible.
 */
export function createTimedCubes(
  cells: readonly TimedCell[],
  material: MeshLambertMaterial,
  size = 0.92,
): TimedCubes | null {
  if (cells.length === 0) return null;

  const geometry = new BoxGeometry(size, size, size);
  const mesh = new InstancedMesh(geometry, material, cells.length);
  mesh.count = 0;
  mesh.frustumCulled = false;

  const dummy = new Object3D();
  let settled = 0;

  const write = (index: number, scale: number, lift: number) => {
    const cell = cells[index]!.cell;
    dummy.position.set(cell[0] + 0.5, cell[1] + 0.5 + lift, cell[2] + 0.5);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  };

  const update = (revealSeconds: number) => {
    const count = placedCount(cells, revealSeconds);
    const popStart = placedCount(cells, revealSeconds - POP_SECONDS);
    let dirty = false;

    // Everything below `popStart` has finished dropping. Writing the gap keeps
    // the invariant that every drawn instance owns a full-scale matrix.
    if (popStart > settled) {
      for (let index = settled; index < popStart; index += 1) write(index, 1, 0);
      dirty = true;
    }
    settled = popStart;

    for (let index = popStart; index < count; index += 1) {
      const raw = (revealSeconds - cells[index]!.at) / POP_SECONDS;
      const progress = Math.min(1, Math.max(0, raw));
      const eased = 1 - (1 - progress) ** 3;
      write(index, 0.35 + 0.65 * eased, (1 - eased) * DROP_HEIGHT);
      dirty = true;
    }

    mesh.count = count;
    if (dirty) mesh.instanceMatrix.needsUpdate = true;
  };

  return { mesh, update };
}

export function createLambert(color: string): MeshLambertMaterial {
  return new MeshLambertMaterial({ color });
}
