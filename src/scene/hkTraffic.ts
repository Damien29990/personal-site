/** Deterministic ground traffic for the HK diorama: walkers, trucks, loaders. Local forward is +z. */

export type Helmet = "yellow" | "white";
export type TruckKind = "mixer" | "tipper" | "flatbed";

type Point = readonly [number, number];

export type Pose = {
  x: number;
  z: number;
  heading: number;
};

type Route = {
  points: readonly Point[];
  closed: boolean;
  lengths: number[];
  starts: number[];
  corners: number[];
  total: number;
};

export const WALKERS_FROM = 6;
export const TRAFFIC_FROM = 8;

/** Hoarding inner face on the gate side; trucks are hidden beyond it. */
export const GATE_Z = -7.6;

/** Yellow = trades, white = management; management stays the minority. */
const HELMET_PATTERN: readonly Helmet[] = ["yellow", "yellow", "yellow", "white"];
export const WALKER_COUNT = 12;

export const WALKERS: ReadonlyArray<{ id: string; helmet: Helmet }> = Array.from(
  { length: WALKER_COUNT },
  (_, index) => ({
    id: `Walker_${String(index).padStart(2, "0")}`,
    helmet: HELMET_PATTERN[index % HELMET_PATTERN.length] ?? "yellow",
  }),
);

export const TRUCKS: ReadonlyArray<{ id: string; kind: TruckKind }> = [
  { id: "Truck_00", kind: "mixer" },
  { id: "Truck_01", kind: "tipper" },
  { id: "Truck_02", kind: "flatbed" },
];

export const LOADERS: ReadonlyArray<{ id: string; side: -1 | 1 }> = [
  { id: "Loader_00", side: -1 },
  { id: "Loader_01", side: 1 },
];

export const STOCKPILE_X = 7.2;
export const STOCKPILE_Z = -6.3;

const WALK_SPEED = 0.8;
const TRUCK_SPEED = 1.3;
const LOADER_PERIOD = 10;
const LOADER_NEAR_X = 2.2;
const LOADER_FAR_X = 6.0;
const CORNER_RADIUS = 0.45;

const COURTYARD_HALF_X = 3.1;
const COURTYARD_HALF_Z = 2.1;
const COURTYARD_TOP = 0.11;
const COURTYARD_RAMP = 0.5;

/** Perimeter walkway as a thin ring: inner lane out, outer lane back. Never meets the haul road. */
const WALK_ROUTE = buildRoute(
  [
    [-7.75, -4.9],
    [-7.75, 5.25],
    [7.75, 5.25],
    [7.75, -4.9],
    [8.05, -4.9],
    [8.05, 5.55],
    [-8.05, 5.55],
    [-8.05, -4.9],
  ],
  true,
);

/** In through the gate on x=+0.6, round tower B, out on x=-0.6; the last leg runs outside the hoarding. */
const HAUL_ROUTE = buildRoute(
  [
    [0.6, -9.2],
    [0.6, -0.9],
    [2.6, -0.9],
    [2.6, 4.0],
    [-2.6, 4.0],
    [-2.6, -0.9],
    [-0.6, -0.9],
    [-0.6, -9.2],
  ],
  true,
);

function buildRoute(points: readonly Point[], closed: boolean): Route {
  const count = points.length;
  const segments = closed ? count : count - 1;
  const lengths: number[] = [];
  const starts: number[] = [];
  let total = 0;
  for (let i = 0; i < segments; i += 1) {
    const a = points[i]!;
    const b = points[(i + 1) % count]!;
    starts.push(total);
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    lengths.push(length);
    total += length;
  }
  const corners = points.map((_, i) => {
    const hasPrev = closed || i > 0;
    const hasNext = closed || i < count - 1;
    if (!hasPrev || !hasNext) return 0;
    const prev = lengths[(i - 1 + segments) % segments]!;
    const next = lengths[i % segments]!;
    return Math.min(CORNER_RADIUS, prev / 2, next / 2);
  });
  return { points, closed, lengths, starts, corners, total };
}

function direction(route: Route, segment: number): Point {
  const a = route.points[segment]!;
  const b = route.points[(segment + 1) % route.points.length]!;
  const length = route.lengths[segment]!;
  return [(b[0] - a[0]) / length, (b[1] - a[1]) / length];
}

function cornerPose(route: Route, vertex: number, u: number): Pose {
  const segments = route.lengths.length;
  const radius = route.corners[vertex]!;
  const v = route.points[vertex]!;
  const a = direction(route, (vertex - 1 + segments) % segments);
  const n = direction(route, vertex % segments);
  const p0: Point = [v[0] - a[0] * radius, v[1] - a[1] * radius];
  const p2: Point = [v[0] + n[0] * radius, v[1] + n[1] * radius];
  const w = 1 - u;
  const x = w * w * p0[0] + 2 * w * u * v[0] + u * u * p2[0];
  const z = w * w * p0[1] + 2 * w * u * v[1] + u * u * p2[1];
  const tx = 2 * w * (v[0] - p0[0]) + 2 * u * (p2[0] - v[0]);
  const tz = 2 * w * (v[1] - p0[1]) + 2 * u * (p2[1] - v[1]);
  return { x, z, heading: Math.atan2(tx, tz) };
}

/** Pose at an arc distance along a route; corners are rounded with a quadratic blend. */
export function poseOnRoute(route: Route, distance: number): Pose {
  const d = route.closed
    ? ((distance % route.total) + route.total) % route.total
    : Math.min(route.total, Math.max(0, distance));
  let segment = route.lengths.length - 1;
  for (let i = 0; i < route.starts.length; i += 1) {
    if (d < route.starts[i]! + route.lengths[i]!) {
      segment = i;
      break;
    }
  }
  const s = d - route.starts[segment]!;
  const length = route.lengths[segment]!;
  const nextVertex = (segment + 1) % route.points.length;
  const startRadius = route.corners[segment]!;
  const endRadius = route.corners[nextVertex]!;

  if (startRadius > 0 && s < startRadius) {
    return cornerPose(route, segment, 0.5 + s / (2 * startRadius));
  }
  if (endRadius > 0 && s > length - endRadius) {
    return cornerPose(route, nextVertex, (s - (length - endRadius)) / (2 * endRadius));
  }
  const a = route.points[segment]!;
  const [dx, dz] = direction(route, segment);
  return { x: a[0] + dx * s, z: a[1] + dz * s, heading: Math.atan2(dx, dz) };
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const k = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return k * k * (3 - 2 * k);
}

/** Top of the sand or the raised courtyard pad, ramped at its edge. */
export function groundHeight(x: number, z: number): number {
  const inside = Math.min(COURTYARD_HALF_X - Math.abs(x), COURTYARD_HALF_Z - Math.abs(z));
  return COURTYARD_TOP * smoothstep(-COURTYARD_RAMP / 2, COURTYARD_RAMP / 2, inside);
}

export function walkerPose(index: number, seconds: number): Pose & { stride: number } {
  const spacing = WALK_ROUTE.total / WALKER_COUNT;
  const distance = seconds * WALK_SPEED + index * spacing;
  return { ...poseOnRoute(WALK_ROUTE, distance), stride: distance };
}

export function truckPose(index: number, seconds: number): Pose & { y: number; visible: boolean } {
  const spacing = HAUL_ROUTE.total / TRUCKS.length;
  const pose = poseOnRoute(HAUL_ROUTE, seconds * TRUCK_SPEED + index * spacing);
  return { ...pose, y: groundHeight(pose.x, pose.z), visible: pose.z > GATE_Z };
}

/** Loader shuttles between the haul road and its stockpile, bucket low going in, raised coming back. */
export function loaderPose(
  side: -1 | 1,
  seconds: number,
): Pose & { arm: number; loaded: boolean } {
  const phase = side < 0 ? 0 : 0.5;
  const s = (((seconds / LOADER_PERIOD + phase) % 1) + 1) % 1;
  const reach = 0.5 - 0.5 * Math.cos(s * Math.PI * 2);
  const x = side * (LOADER_NEAR_X + (LOADER_FAR_X - LOADER_NEAR_X) * reach);
  const lift = smoothstep(0.5, 0.62, s) * (1 - smoothstep(0.88, 1, s));
  return {
    x,
    z: STOCKPILE_Z,
    heading: side * (Math.PI / 2),
    arm: 0.45 - 1.15 * lift,
    loaded: s > 0.52 && s < 0.92,
  };
}
