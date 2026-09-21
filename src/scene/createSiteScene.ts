import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshLambertMaterial,
  NoToneMapping,
  OrthographicCamera,
  PCFSoftShadowMap,
  QuadraticBezierCurve3,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { palette } from "@/scene/palette";
import {
  BUILD_SECONDS,
  LOOP_SECONDS,
  assignBuildTimes,
  revealTime,
  stageIndexAt,
  wrapTime,
} from "@/scene/schedule";
import {
  createLambert,
  createTimedCubes,
  pushFill,
  pushRing,
  type Cell,
  type TimedCubes,
} from "@/scene/voxels";

export type SiteSceneHandle = {
  dispose: () => void;
  duration: number;
  getTime: () => number;
  setTime: (seconds: number) => void;
  setRunning: (running: boolean) => void;
  isRunning: () => boolean;
  onTick: (listener: (seconds: number, stageIndex: number) => void) => () => void;
};

const FRUSTUM = 18;
const LOOK_AT = new Vector3(0, 3.2, 0);
const COMPACT_WIDTH = 640;
const TICK_SECONDS = 0.1;

/** Cycles per loop. Integers keep every motion seamless across the 60s seam. */
const TURNTABLE_TURNS = 1;
const BOOM_TURNS = 3;
const HOOK_CYCLES = 12;
const SENSOR_CYCLES = 20;

/** Hook only hangs once the jib is finished. */
const CRANE_READY = 20;

type Hop = {
  mesh: Mesh;
  line: Line;
  curve: QuadraticBezierCurve3;
  cycles: number;
  offset: number;
  at: number;
};

type Sensor = {
  mesh: Mesh;
  material: MeshLambertMaterial;
  phase: number;
  at: number;
};

function canCreateWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function layoutSite(): Record<
  "sand" | "pad" | "slab" | "column" | "scaffold" | "mast" | "jib" | "cabin" | "roof" | "fence" | "pallet",
  Cell[]
> {
  const sand: Cell[] = [];
  const pad: Cell[] = [];
  const slab: Cell[] = [];
  const column: Cell[] = [];
  const scaffold: Cell[] = [];
  const mast: Cell[] = [];
  const jib: Cell[] = [];
  const cabin: Cell[] = [];
  const roof: Cell[] = [];
  const fence: Cell[] = [];
  const pallet: Cell[] = [];

  for (let x = -8; x <= 8; x += 1) {
    for (let z = -8; z <= 8; z += 1) {
      const inner = x >= -4 && x <= 4 && z >= -4 && z <= 3;
      if (inner) pad.push([x, 0, z]);
      else sand.push([x, 0, z]);
    }
  }

  const feet: Array<[number, number]> = [
    [-2, -2],
    [2, -2],
    [-2, 2],
    [2, 2],
  ];
  for (const [cx, cz] of feet) {
    pushFill(column, cx, cx, 1, 8, cz, cz);
  }

  pushRing(slab, -2, 2, 1, -2, 2);
  pushRing(slab, -2, 2, 3, -2, 2);
  pushFill(slab, -2, 1, 5, 5, -2, 1, (x, _y, z) => x === 2 && z === 2);
  pushFill(slab, -2, 0, 7, 7, -2, 0);

  for (const x of [-3, 3] as const) {
    for (const z of [-2, 0, 2] as const) {
      pushFill(scaffold, x, x, 1, 6, z, z);
    }
    pushFill(scaffold, x, x, 2, 2, -2, 2);
    pushFill(scaffold, x, x, 4, 4, -2, 2);
    pushFill(scaffold, x, x, 6, 6, -2, 2);
  }

  pushFill(cabin, 5, 7, 1, 2, -7, -5, (x, y, z) => x === 6 && y === 1 && z === -5);
  pushFill(roof, 5, 7, 3, 3, -7, -5);
  roof.push([6, 4, -6]);

  pushFill(pallet, 5, 6, 1, 1, 4, 5);
  pallet.push([5, 2, 4], [6, 2, 4], [5, 2, 5]);

  for (let x = -8; x <= 8; x += 1) {
    if (x % 2 === 0) {
      fence.push([x, 1, -8], [x, 1, 8]);
    }
  }
  for (let z = -7; z <= 7; z += 1) {
    if (z % 2 === 0) {
      fence.push([-8, 1, z], [8, 1, z]);
    }
  }

  pushFill(mast, 0, 0, 1, 14, 0, 0);

  // Jib cells are local to the boom pivot at the mast head.
  pushFill(jib, 2, 12, 0, 0, 0, 0);
  pushFill(jib, -4, -2, 0, 0, 0, 0);
  jib.push([0, 0, 0], [1, 0, 0], [-1, 0, 0], [12, -1, 0], [-4, 1, 0]);

  return {
    sand,
    pad,
    slab,
    column,
    scaffold,
    mast,
    jib,
    cabin,
    roof,
    fence,
    pallet,
  };
}

function snapCamera(camera: OrthographicCamera, heightPx: number): void {
  const worldPerPixel = (camera.top - camera.bottom) / Math.max(heightPx, 1);
  camera.position.x = Math.round(camera.position.x / worldPerPixel) * worldPerPixel;
  camera.position.y = Math.round(camera.position.y / worldPerPixel) * worldPerPixel;
  camera.position.z = Math.round(camera.position.z / worldPerPixel) * worldPerPixel;
  camera.lookAt(LOOK_AT);
}

function hopCurve(from: Vector3, to: Vector3): QuadraticBezierCurve3 {
  const mid = from.clone().lerp(to, 0.5);
  mid.y += 3.2;
  return new QuadraticBezierCurve3(from, mid, to);
}

export function createSiteScene(container: HTMLElement): SiteSceneHandle | null {
  if (!canCreateWebGL()) return null;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }

  const compact = window.innerWidth < COMPACT_WIDTH;
  const maxPixelRatio = compact ? 1.25 : 1.5;

  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.shadowMap.enabled = !compact;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(new Color(palette.paper), 1);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "pan-y";
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 120);
  camera.position.set(20, 20, 20);
  camera.lookAt(LOOK_AT);

  scene.add(new AmbientLight(palette.paper, 0.55));
  scene.add(new HemisphereLight(palette.paper, palette.pad, 0.4));
  const sun = new DirectionalLight("#fff7ed", 1.05);
  sun.position.set(14, 22, 10);
  sun.castShadow = !compact;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  scene.add(sun);

  const mats = {
    sand: createLambert(palette.sand),
    pad: createLambert(palette.pad),
    slab: createLambert(palette.slab),
    column: createLambert(palette.column),
    scaffold: createLambert(palette.scaffold),
    steel: createLambert(palette.steel),
    crane: createLambert(palette.crane),
    cabin: createLambert(palette.cabin),
    roof: createLambert(palette.roof),
    fence: createLambert(palette.fence),
    pallet: createLambert(palette.pallet),
    hop: new MeshLambertMaterial({
      color: palette.hop,
      emissive: palette.hop,
      emissiveIntensity: 0.7,
    }),
    line: new LineBasicMaterial({
      color: palette.hop,
      transparent: true,
      opacity: 0.32,
    }),
  };

  const turntable = new Group();
  scene.add(turntable);

  const craneRoot = new Group();
  craneRoot.position.set(-6, 0, 5);
  turntable.add(craneRoot);

  const boom = new Group();
  boom.position.set(0.5, 15, 0.5);
  const boomInner = new Group();
  boomInner.position.set(-0.5, 0, -0.5);
  boom.add(boomInner);
  craneRoot.add(boom);

  const layout = layoutSite();
  const timed: TimedCubes[] = [];

  const addTimed = (
    parent: Group,
    cells: readonly Cell[],
    material: MeshLambertMaterial,
    from: number,
    to: number,
    order: Parameters<typeof assignBuildTimes>[3],
    shadows = true,
  ) => {
    const group = createTimedCubes(assignBuildTimes(cells, from, to, order), material);
    if (!group) return;
    group.mesh.castShadow = shadows && !compact;
    group.mesh.receiveShadow = shadows && !compact;
    parent.add(group.mesh);
    timed.push(group);
  };

  addTimed(turntable, layout.pad, mats.pad, 0, 2.4, "from-center");
  addTimed(turntable, layout.sand, mats.sand, 1.2, 4.2, "from-center", false);
  addTimed(turntable, layout.fence, mats.fence, 3.8, 5, "sequential", false);
  addTimed(turntable, layout.column, mats.column, 5, 12, "bottom-up");
  addTimed(craneRoot, layout.mast, mats.steel, 12, 18, "bottom-up");
  addTimed(boomInner, layout.jib, mats.crane, 18, 20, "sequential");
  addTimed(turntable, layout.slab, mats.slab, 20, 42, "bottom-up");
  addTimed(turntable, layout.scaffold, mats.scaffold, 42, 48, "bottom-up");
  addTimed(turntable, layout.cabin, mats.cabin, 48, 50.4, "bottom-up");
  addTimed(turntable, layout.roof, mats.roof, 50, 51.4, "bottom-up");
  addTimed(turntable, layout.pallet, mats.pallet, 51, 52, "bottom-up");

  const hook = new Mesh(new BoxGeometry(0.38, 0.38, 0.38), mats.crane);
  hook.castShadow = !compact;
  const cable = new Mesh(new BoxGeometry(0.08, 1, 0.08), mats.steel);
  cable.castShadow = !compact;
  boomInner.add(hook, cable);

  const gateway = new Vector3(6.5, 4.6, -5.5);
  const sensorGeo = new BoxGeometry(0.46, 0.46, 0.46);
  const sensorSpecs = [
    { position: new Vector3(0.5, 4.2, 0.5), phase: 0.2, at: 52 },
    { position: new Vector3(-1.5, 6.2, -1.5), phase: 1.1, at: 52.9 },
    { position: new Vector3(1.5, 2.2, -1.5), phase: 2.0, at: 53.8 },
    { position: new Vector3(-3.5, 1.4, -3.5), phase: 0.7, at: 54.7 },
  ];

  const sensors: Sensor[] = sensorSpecs.map((spec) => {
    const material = new MeshLambertMaterial({
      color: palette.sensor,
      emissive: palette.sensor,
      emissiveIntensity: 0.5,
    });
    const mesh = new Mesh(sensorGeo, material);
    mesh.position.copy(spec.position);
    mesh.castShadow = !compact;
    turntable.add(mesh);
    return { mesh, material, phase: spec.phase, at: spec.at };
  });

  const hopGeo = new BoxGeometry(0.18, 0.18, 0.18);
  const hopCycles = [6, 9, 12, 15];
  const hops: Hop[] = sensorSpecs.map((spec, index) => {
    const curve = hopCurve(spec.position.clone(), gateway.clone());
    const line = new Line(new BufferGeometry().setFromPoints(curve.getPoints(12)), mats.line);
    const mesh = new Mesh(hopGeo, mats.hop);
    turntable.add(line, mesh);
    return {
      mesh,
      line,
      curve,
      cycles: hopCycles[index] ?? 6,
      offset: index * 0.18,
      at: spec.at + 1.6,
    };
  });

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedQuery.matches;
  let inView = true;
  let tabVisible = document.visibilityState !== "hidden";
  let running = true;
  let raf = 0;
  let elapsed = 0;
  let lastNow = 0;
  let viewHeight = 1;

  const listeners = new Set<(seconds: number, stageIndex: number) => void>();
  let lastEmitTime = -1;
  let lastEmitStage = -1;

  const emit = (force = false) => {
    const stage = stageIndexAt(elapsed);
    if (!force && stage === lastEmitStage && Math.abs(elapsed - lastEmitTime) < TICK_SECONDS) {
      return;
    }
    lastEmitTime = elapsed;
    lastEmitStage = stage;
    for (const listener of listeners) listener(elapsed, stage);
  };

  const loopActive = () => running && inView && tabVisible && !reducedMotion;

  const applyTime = (seconds: number) => {
    const t = wrapTime(seconds);
    const reveal = revealTime(t);
    const turn = (Math.PI * 2 * t) / LOOP_SECONDS;

    for (const group of timed) group.update(reveal);

    turntable.rotation.y = turn * TURNTABLE_TURNS;
    boom.rotation.y = turn * BOOM_TURNS;

    const craneReady = reveal >= CRANE_READY;
    hook.visible = craneReady;
    cable.visible = craneReady;
    if (craneReady) {
      const bob = 0.5 + 0.5 * Math.sin(turn * HOOK_CYCLES);
      const drop = 2.2 + 1.4 * bob;
      hook.position.set(11.5, -drop, 0.5);
      cable.position.set(11.5, -drop / 2, 0.5);
      cable.scale.y = drop;
    }

    for (const sensor of sensors) {
      const progress = Math.min(1, Math.max(0, (reveal - sensor.at) / 0.4));
      sensor.mesh.visible = progress > 0;
      sensor.mesh.scale.setScalar(0.3 + 0.7 * progress);
      sensor.material.emissiveIntensity =
        0.28 + 0.72 * (0.5 + 0.5 * Math.sin(turn * SENSOR_CYCLES + sensor.phase));
    }

    for (const hop of hops) {
      const live = reveal >= hop.at;
      hop.mesh.visible = live;
      hop.line.visible = live;
      if (live) {
        const u = (((t * hop.cycles) / LOOP_SECONDS + hop.offset) % 1 + 1) % 1;
        hop.curve.getPoint(u, hop.mesh.position);
      }
    }
  };

  const renderFrame = (now: number) => {
    if (lastNow === 0) lastNow = now;
    const delta = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    if (loopActive()) elapsed = wrapTime(elapsed + delta);
    applyTime(elapsed);
    renderer.render(scene, camera);
    emit();
  };

  const tick = (now: number) => {
    raf = 0;
    renderFrame(now);
    if (loopActive()) raf = requestAnimationFrame(tick);
  };

  const kick = () => {
    if (loopActive() && raf === 0) {
      lastNow = 0;
      raf = requestAnimationFrame(tick);
    }
  };

  const stop = () => {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    lastNow = 0;
  };

  const drawOnce = () => {
    applyTime(elapsed);
    renderer.render(scene, camera);
  };

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 2 || height < 2) return;
    viewHeight = height;
    const aspect = width / height;
    camera.left = (-FRUSTUM * aspect) / 2;
    camera.right = (FRUSTUM * aspect) / 2;
    camera.top = FRUSTUM / 2;
    camera.bottom = -FRUSTUM / 2;
    camera.updateProjectionMatrix();
    snapCamera(camera, viewHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.setSize(width, height, false);
    drawOnce();
  };

  const onVisibility = () => {
    tabVisible = document.visibilityState !== "hidden";
    if (loopActive()) kick();
    else stop();
  };

  const onMotion = () => {
    reducedMotion = reducedQuery.matches;
    if (reducedMotion) {
      stop();
      elapsed = BUILD_SECONDS;
      drawOnce();
      emit(true);
      return;
    }
    kick();
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      if (loopActive()) kick();
      else stop();
    },
    { threshold: 0.12 },
  );
  io.observe(container);

  const ro = new ResizeObserver(resize);
  ro.observe(container);

  document.addEventListener("visibilitychange", onVisibility);
  reducedQuery.addEventListener("change", onMotion);

  if (reducedMotion) elapsed = BUILD_SECONDS;
  resize();
  emit(true);
  kick();

  return {
    duration: LOOP_SECONDS,
    getTime: () => elapsed,
    setTime: (seconds: number) => {
      elapsed = wrapTime(seconds);
      drawOnce();
      emit(true);
    },
    setRunning: (next: boolean) => {
      running = next;
      if (loopActive()) kick();
      else stop();
      emit(true);
    },
    isRunning: () => running,
    onTick: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose: () => {
      stop();
      listeners.clear();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reducedQuery.removeEventListener("change", onMotion);

      const seenMaterials = new Set<MeshLambertMaterial | LineBasicMaterial>();
      const seenGeometry = new Set<BufferGeometry>();
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof InstancedMesh || object instanceof Line) {
          if (!seenGeometry.has(object.geometry)) {
            seenGeometry.add(object.geometry);
            object.geometry.dispose();
          }
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) {
            if (material instanceof MeshLambertMaterial || material instanceof LineBasicMaterial) {
              if (!seenMaterials.has(material)) {
                seenMaterials.add(material);
                material.dispose();
              }
            }
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
