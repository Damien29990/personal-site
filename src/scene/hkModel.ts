import {
  BoxGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  type Material,
} from "three";
import { STOREY_HEIGHT, TOWERS, storeyName } from "./hkTimeline.ts";

const H = STOREY_HEIGHT;

const color = {
  sand: "#E6DFD0",
  pad: "#DDD6C6",
  slab: "#E7E1D4",
  frame: "#F7F5F0",
  column: "#243044",
  glass: "#8FA4B8",
  steel: "#1E293B",
  crane: "#FF5500",
  craneWhite: "#F4F1EA",
  craneRed: "#DC2626",
  bamboo: "#C6A15B",
  net: "#1B7A3A",
  fan: "#8E9AA6",
  vest: "#D6F25A",
  helmetY: "#F5C400",
  helmetW: "#F7F7F2",
  mic: "#E4DDD0",
  sensor: "#FF5500",
  cabin: "#F7F5F0",
  roof: "#FF5500",
} as const;

function materials(): Record<string, MeshLambertMaterial> {
  const out: Record<string, MeshLambertMaterial> = {};
  for (const [name, hex] of Object.entries(color)) {
    const material = new MeshLambertMaterial({ color: hex });
    if (name === "net") {
      material.transparent = true;
      material.opacity = 0.42;
      material.depthWrite = false;
    }
    if (name === "glass") {
      material.transparent = true;
      material.opacity = 0.72;
    }
    if (name === "sensor") {
      material.emissive.set(hex);
      material.emissiveIntensity = 0.45;
    }
    out[name] = material;
  }
  return out;
}

const geos = new Map<string, BoxGeometry>();

function geo(w: number, h: number, d: number): BoxGeometry {
  const key = `${w}|${h}|${d}`;
  const cached = geos.get(key);
  if (cached) return cached;
  const created = new BoxGeometry(w, h, d);
  geos.set(key, created);
  return created;
}

function addBox(
  parent: Group,
  name: string,
  size: readonly [number, number, number],
  position: readonly [number, number, number],
  material: Material,
): Mesh {
  const mesh = new Mesh(geo(size[0], size[1], size[2]), material);
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  parent.add(mesh);
  return mesh;
}

function storey(level: number, floors: number, mats: ReturnType<typeof materials>): Group {
  const group = new Group();
  const slab = mats.slab;
  addBox(group, "slab", [3.5, 0.16, 2.9], [0, 0, 0], slab);
  const colY = 0.34;
  for (const x of [-1.55, 1.55] as const) {
    for (const z of [-1.25, 1.25] as const) {
      addBox(group, "column", [0.22, H * 0.92, 0.22], [x, colY, z], mats.column);
    }
  }
  if (level < floors - 1) {
    for (const x of [-1.05, 0, 1.05] as const) {
      addBox(group, "mullion", [0.08, 0.5, 0.08], [x, 0.38, 1.48], mats.frame);
      addBox(group, "glass", [0.72, 0.42, 0.04], [x, 0.38, 1.52], mats.glass);
    }
  }
  return group;
}

function addTowers(root: Group, mats: ReturnType<typeof materials>): void {
  for (const tower of TOWERS) {
    const towerGroup = new Group();
    towerGroup.name = `Tower${tower.id}`;
    towerGroup.position.set(tower.x, 0, tower.z);
    for (let level = 0; level < tower.floors; level += 1) {
      const floor = storey(level, tower.floors, mats);
      floor.name = storeyName(tower.id, level);
      floor.position.y = 0.28 + level * H + 0.08;
      towerGroup.add(floor);
    }
    const core = new Group();
    core.name = `Tower${tower.id}_Core`;
    const coreH = tower.floors * H;
    addBox(core, "core", [1.15, coreH, 1.05], [0.15, coreH / 2 + 0.2, -0.15], mats.column);
    towerGroup.add(core);
    root.add(towerGroup);
  }
}

function addCrane(root: Group, mats: ReturnType<typeof materials>): void {
  const crane = new Group();
  crane.name = "Crane_Product";
  crane.position.set(0.9, 0, 2.55);

  for (let i = 0; i < 8; i += 1) {
    const z = 0.55 + i * 1.05;
    addBox(crane, "mast", [0.72, 1.02, 0.72], [0, z, 0], mats.steel);
    addBox(crane, "brace", [0.84, 0.06, 0.06], [0, z, 0.34], i % 2 === 0 ? mats.crane : mats.craneWhite);
  }

  const slew = new Group();
  slew.name = "Crane_Slew";
  slew.position.set(0, 8.7, 0);
  crane.add(slew);
  addBox(slew, "ring", [1.25, 0.22, 1.25], [0, 0.1, 0], mats.steel);
  addBox(slew, "cab", [0.9, 0.7, 1.05], [0.1, 0.55, -0.85], mats.frame);
  addBox(slew, "cabRoof", [0.96, 0.08, 1.12], [0.1, 0.94, -0.85], mats.crane);
  addBox(slew, "jib", [7.6, 0.16, 0.22], [4.1, 0.42, 0], mats.crane);
  addBox(slew, "jibStripe", [7.4, 0.05, 0.26], [4.1, 0.54, 0], mats.craneWhite);
  addBox(slew, "jibRed", [1.3, 0.06, 0.28], [7.2, 0.54, 0], mats.craneRed);
  addBox(slew, "counter", [2.4, 0.18, 0.28], [-1.6, 0.42, 0], mats.steel);
  addBox(slew, "weight", [1.1, 0.55, 0.7], [-2.5, 0.15, 0], mats.column);
  addBox(slew, "Crane_Hook", [0.28, 0.36, 0.22], [6.6, -1.5, 0], mats.crane);
  addBox(slew, "Crane_Cable", [0.04, 1.5, 0.04], [6.6, -0.7, 0], mats.steel);
  root.add(crane);
}

function addEnvelope(root: Group, mats: ReturnType<typeof materials>): void {
  const bamboo = new Group();
  bamboo.name = "Bamboo";
  bamboo.position.set(-5.4, 0, -3.15);
  for (const x of [-1.6, -0.5, 0.6, 1.6] as const) {
    addBox(bamboo, "pole", [0.08, 7.2, 0.08], [x, 3.7, 0], mats.bamboo);
  }
  for (let i = 0; i < 4; i += 1) {
    addBox(bamboo, "ledgers", [3.4, 0.06, 0.06], [0, 1.8 + i * 1.5, 0.12], mats.bamboo);
  }
  for (let i = 0; i < 5; i += 1) {
    const brace = addBox(bamboo, "cross", [2.2, 0.05, 0.05], [0, 1.4 + i * 1.2, 0.16], mats.bamboo);
    brace.rotation.z = i % 2 === 0 ? 0.7 : -0.7;
  }
  root.add(bamboo);

  const net = new Group();
  net.name = "GreenNet";
  net.position.set(-5.4, 0, -3.28);
  addBox(net, "sheet", [3.6, 6.6, 0.02], [0, 3.6, 0], mats.net);
  for (let i = 0; i < 7; i += 1) {
    const strip = addBox(net, "diagonal", [4.2, 0.06, 0.03], [0, 1.2 + i * 0.85, 0.03], mats.net);
    strip.rotation.z = 0.78;
  }
  root.add(net);

  const fans = new Group();
  fans.name = "CatchFan";
  fans.position.set(-5.4, 0, -1.5);
  for (const level of [2, 5, 8] as const) {
    addBox(fans, "fan", [3.3, 0.06, 1.15], [0, 0.5 + level * H, -2.15], mats.fan);
    addBox(fans, "fanEdge", [3.3, 0.08, 0.08], [0, 0.56 + level * H, -2.7], mats.net);
  }
  root.add(fans);

  const precast = new Group();
  precast.name = "Precast";
  precast.position.set(5.4, 0, -1.5);
  for (let level = 1; level <= 6; level += 1) {
    addBox(precast, "panel", [3.2, 0.62, 0.08], [0, 0.45 + level * H, 1.52], mats.frame);
    addBox(precast, "joint", [3.2, 0.04, 0.1], [0, 0.12 + level * H, 1.54], mats.column);
  }
  root.add(precast);

  const mic = new Group();
  mic.name = "MiC_Top";
  mic.position.set(0, 0.4 + 10 * H, 1.6);
  addBox(mic, "boxA", [1.55, 0.7, 1.35], [-0.85, 0.4, 0], mats.mic);
  addBox(mic, "boxB", [1.55, 0.7, 1.35], [0.85, 0.4, 0.15], mats.mic);
  addBox(mic, "seam", [0.06, 0.72, 1.4], [0, 0.4, 0.05], mats.craneRed);
  root.add(mic);

  const guards = new Group();
  guards.name = "Guards";
  guards.position.set(0, 0.55 + 9 * H, 1.6);
  for (let i = 0; i < 8; i += 1) {
    addBox(
      guards,
      "rail",
      [0.42, 0.28, 0.06],
      [-1.6 + i * 0.46, 0.7, 1.45],
      i % 2 === 0 ? mats.craneRed : mats.craneWhite,
    );
  }
  root.add(guards);
}

function addAlimak(root: Group, mats: ReturnType<typeof materials>): void {
  const hoist = new Group();
  hoist.name = "Alimak";
  hoist.position.set(7.35, 0, -1.5);
  addBox(hoist, "mast", [0.28, 6.4, 0.28], [0, 3.3, 0], mats.steel);
  const cage = new Group();
  cage.name = "Alimak_Cage";
  cage.position.set(0.35, 2.2, 0);
  hoist.add(cage);
  addBox(cage, "cage", [0.7, 0.9, 0.7], [0, 0, 0], mats.crane);
  addBox(cage, "cageGate", [0.5, 0.7, 0.04], [0, 0, 0.36], mats.steel);
  root.add(hoist);
}

function addWorkers(root: Group, mats: ReturnType<typeof materials>): void {
  const workers = new Group();
  workers.name = "Workers";
  const spots: Array<[number, number, number, boolean]> = [
    [-5.2, 0.7 + 2 * H, -1.2, true],
    [-4.6, 0.7 + 5 * H, -1.7, false],
    [0.4, 0.7 + 4 * H, 2.2, true],
    [-0.6, 0.7 + 7 * H, 1.2, false],
    [5.2, 0.7 + 3 * H, -1.2, true],
    [5.8, 0.7 + 6 * H, -1.8, false],
    [-6.8, 0.35, -4.2, true],
    [6.6, 0.35, 3.4, false],
  ];
  spots.forEach(([x, y, z, yellow], index) => {
    const person = new Group();
    person.name = `Worker_${String(index).padStart(2, "0")}`;
    person.position.set(x, y, z);
    addBox(person, "body", [0.22, 0.28, 0.14], [0, 0.16, 0], mats.column);
    addBox(person, "vest", [0.24, 0.16, 0.16], [0, 0.22, 0], mats.vest);
    addBox(person, "helmet", [0.18, 0.1, 0.18], [0, 0.38, 0], yellow ? mats.helmetY : mats.helmetW);
    workers.add(person);
  });
  root.add(workers);
}

function addIot(root: Group, mats: ReturnType<typeof materials>): void {
  const iot = new Group();
  iot.name = "IoT";
  const sensors: Array<[number, number, number]> = [
    [-5.4, 0.9 + 3 * H, -1.5],
    [0.2, 0.9 + 6 * H, 1.6],
    [5.4, 0.9 + 4 * H, -1.5],
    [0.9, 6.4, 2.55],
  ];
  sensors.forEach((position, index) => {
    addBox(iot, `Sensor_${String(index).padStart(2, "0")}`, [0.22, 0.22, 0.22], position, mats.sensor);
  });

  const cabin = new Group();
  cabin.name = "Gateway";
  cabin.position.set(-7.6, 0, 4.2);
  addBox(cabin, "body", [1.8, 1.15, 1.15], [0, 0.65, 0], mats.cabin);
  addBox(cabin, "roof", [1.95, 0.1, 1.28], [0, 1.28, 0], mats.roof);
  addBox(cabin, "antenna", [0.08, 0.45, 0.08], [0.4, 1.6, 0], mats.sensor);
  iot.add(cabin);
  root.add(iot);
}

/** Named groups the timeline reveals. Crane, hoist cage, and sensors stay findable by name. */
export function buildHkDiorama(): Group {
  const mats = materials();
  const root = new Group();
  root.name = "HKSite";

  const ground = new Group();
  ground.name = "Ground";
  addBox(ground, "sand", [18, 0.16, 16], [0, -0.08, 0], mats.sand);
  addBox(ground, "courtyard", [6.2, 0.18, 4.2], [0, 0.02, 0], mats.pad);
  root.add(ground);

  const hoarding = new Group();
  hoarding.name = "Hoarding";
  addBox(hoarding, "north", [17.2, 0.9, 0.08], [0, 0.45, -7.6], mats.pad);
  addBox(hoarding, "south", [17.2, 0.9, 0.08], [0, 0.45, 7.6], mats.pad);
  addBox(hoarding, "west", [0.08, 0.9, 15.2], [-8.6, 0.45, 0], mats.pad);
  addBox(hoarding, "east", [0.08, 0.9, 15.2], [8.6, 0.45, 0], mats.pad);
  addBox(hoarding, "gateL", [1.4, 0.9, 0.1], [-2.2, 0.45, -7.6], mats.column);
  addBox(hoarding, "gateR", [1.4, 0.9, 0.1], [2.2, 0.45, -7.6], mats.column);
  root.add(hoarding);

  const foundation = new Group();
  foundation.name = "Foundation";
  for (const tower of TOWERS) {
    addBox(
      foundation,
      "raft",
      [4.1, 0.28, 3.4],
      [tower.x, 0.12, tower.z],
      mats.column,
    );
  }
  root.add(foundation);

  addTowers(root, mats);
  addCrane(root, mats);
  addEnvelope(root, mats);
  addAlimak(root, mats);
  addWorkers(root, mats);
  addIot(root, mats);
  return root;
}
