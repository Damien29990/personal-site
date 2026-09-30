import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  NoToneMapping,
  Object3D,
  OrthographicCamera,
  PCFSoftShadowMap,
  QuadraticBezierCurve3,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { withBasePath } from "@/lib/paths";
import { buildHkDiorama } from "@/scene/hkModel";
import { revealSpecs, type RevealSpec } from "@/scene/hkTimeline";
import { palette } from "@/scene/palette";
import {
  BUILD_SECONDS,
  LOOP_SECONDS,
  revealTime,
  stageIndexAt,
  wrapTime,
} from "@/scene/schedule";

export type SiteSceneHandle = {
  dispose: () => void;
  duration: number;
  getTime: () => number;
  setTime: (seconds: number) => void;
  getYaw: () => number;
  setYaw: (radians: number) => void;
  getPitch: () => number;
  setPitch: (radians: number) => void;
  getZoom: () => number;
  setZoom: (zoom: number) => void;
  setRunning: (running: boolean) => void;
  isRunning: () => boolean;
  onTick: (listener: (seconds: number, stageIndex: number) => void) => () => void;
};

const FRUSTUM = 13;
const LOOK_AT = new Vector3(0, 3.6, 0);
const BASE_YAW = Math.PI / 4;
const ORBIT_RADIUS = 22;
const PITCH_MIN = 0.18;
const PITCH_MAX = 1.2;
const ZOOM_MIN = 0.65;
const ZOOM_MAX = 2.6;
const COMPACT_WIDTH = 640;
const TICK_SECONDS = 0.1;

type Hop = {
  mesh: Mesh;
  line: Line;
  curve: QuadraticBezierCurve3;
};

function canCreateWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function clampPitch(radians: number): number {
  return Math.min(PITCH_MAX, Math.max(PITCH_MIN, radians));
}

function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

function revealProgress(reveal: number, spec: RevealSpec): number {
  const span = Math.max(0.001, spec.to - spec.from);
  return Math.min(1, Math.max(0, (reveal - spec.from) / span));
}

async function loadDiorama(): Promise<Object3D> {
  try {
    const gltf = await new GLTFLoader().loadAsync(withBasePath("/site-hk-timelapse.glb"));
    return gltf.scene;
  } catch {
    return buildHkDiorama();
  }
}

export async function createSiteScene(container: HTMLElement): Promise<SiteSceneHandle | null> {
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
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 80);

  scene.add(new AmbientLight(palette.paper, 0.62));
  scene.add(new HemisphereLight(palette.paper, palette.pad, 0.38));
  const sun = new DirectionalLight("#fff7ed", 1.05);
  sun.position.set(12, 18, 8);
  scene.add(sun);

  const diorama = await loadDiorama();
  scene.add(diorama);
  diorama.traverse((object) => {
    if (!(object instanceof Mesh) || Array.isArray(object.material)) return;
    if (object.name === "glass" || object.name === "sheet" || object.name === "diagonal") {
      object.material.transparent = true;
      object.material.opacity = object.name === "glass" ? 0.72 : 0.45;
      object.material.depthWrite = object.name === "glass";
    }
    if (object.name.startsWith("Sensor_")) {
      object.material = new MeshLambertMaterial({
        color: palette.sensor,
        emissive: palette.sensor,
        emissiveIntensity: 0.45,
      });
    }
  });

  const specs = revealSpecs();
  const revealed = specs.flatMap((spec) => {
    const object = diorama.getObjectByName(spec.name);
    return object ? [{ spec, object }] : [];
  });

  const slew = diorama.getObjectByName("Crane_Slew");
  const hook = diorama.getObjectByName("Crane_Hook");
  const cable = diorama.getObjectByName("Crane_Cable");
  const cage = diorama.getObjectByName("Alimak_Cage");
  const sensors = [0, 1, 2, 3]
    .map((index) => diorama.getObjectByName(`Sensor_${String(index).padStart(2, "0")}`))
    .filter((object): object is Object3D => Boolean(object));
  const gateway = diorama.getObjectByName("Gateway");

  const hopMaterial = new MeshLambertMaterial({
    color: palette.hop,
    emissive: palette.hop,
    emissiveIntensity: 0.7,
  });
  const lineMaterial = new LineBasicMaterial({ color: palette.hop, transparent: true, opacity: 0.35 });
  const hopGeo = new BoxGeometry(0.16, 0.16, 0.16);
  const hops: Hop[] = [];

  if (gateway) {
    const to = new Vector3();
    gateway.getWorldPosition(to);
    to.y += 1.2;
    sensors.forEach((sensor, index) => {
      const from = new Vector3();
      sensor.getWorldPosition(from);
      const mid = from.clone().lerp(to, 0.5);
      mid.y += 2.4;
      const curve = new QuadraticBezierCurve3(from, mid, to);
      const line = new Line(new BufferGeometry().setFromPoints(curve.getPoints(10)), lineMaterial);
      const mesh = new Mesh(hopGeo, hopMaterial);
      scene.add(line, mesh);
      hops.push({ mesh, line, curve });
      void index;
    });
  }

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedQuery.matches;
  let inView = true;
  let tabVisible = document.visibilityState !== "hidden";
  let running = !reducedMotion;
  let raf = 0;
  let elapsed = reducedMotion ? BUILD_SECONDS : 0;
  let userYaw = 0;
  let pitch = 0.62;
  let zoom = 1;
  let lastNow = 0;

  const listeners = new Set<(seconds: number, stageIndex: number) => void>();
  let lastEmitTime = -1;
  let lastEmitStage = -1;

  const emit = (force = false) => {
    const stage = stageIndexAt(elapsed);
    if (!force && stage === lastEmitStage && Math.abs(elapsed - lastEmitTime) < TICK_SECONDS) return;
    lastEmitTime = elapsed;
    lastEmitStage = stage;
    for (const listener of listeners) listener(elapsed, stage);
  };

  const placeCamera = () => {
    const yaw = BASE_YAW + userYaw;
    const horizontal = Math.cos(pitch) * ORBIT_RADIUS;
    camera.position.set(
      LOOK_AT.x + Math.sin(yaw) * horizontal,
      LOOK_AT.y + Math.sin(pitch) * ORBIT_RADIUS,
      LOOK_AT.z + Math.cos(yaw) * horizontal,
    );
    camera.lookAt(LOOK_AT);
  };

  const frameCamera = (width: number, height: number) => {
    const aspect = width / Math.max(height, 1);
    const frustum = FRUSTUM / zoom;
    camera.left = (-frustum * aspect) / 2;
    camera.right = (frustum * aspect) / 2;
    camera.top = frustum / 2;
    camera.bottom = -frustum / 2;
    camera.updateProjectionMatrix();
    placeCamera();
  };

  const applyTime = (seconds: number) => {
    const t = wrapTime(seconds);
    const reveal = revealTime(t);

    for (const item of revealed) {
      const progress = revealProgress(reveal, item.spec);
      item.object.visible = progress > 0.04;
      const scale = item.spec.mode === "unit" ? 0.2 + 0.8 * progress : 0.35 + 0.65 * progress;
      item.object.scale.setScalar(progress >= 1 ? 1 : scale);
    }

    if (slew) slew.rotation.y = (t / LOOP_SECONDS) * Math.PI * 2 * 0.35;
    if (hook && cable && slew) {
      const drop = 1.1 + 0.85 * (0.5 + 0.5 * Math.sin((t / LOOP_SECONDS) * Math.PI * 8));
      hook.position.set(6.6, -drop, 0);
      cable.position.set(6.6, -drop / 2, 0);
      cable.scale.y = Math.max(0.2, drop / 1.5);
    }
    if (cage) {
      const ride = reveal >= 64 ? (0.5 + 0.5 * Math.sin((t / LOOP_SECONDS) * Math.PI * 6)) : 0.15;
      cage.position.y = 1.1 + ride * 4.4;
    }

    sensors.forEach((sensor, index) => {
      const material = sensor instanceof Mesh ? sensor.material : null;
      if (material instanceof MeshLambertMaterial || material instanceof MeshStandardMaterial) {
        material.emissive.set(palette.sensor);
        material.emissiveIntensity = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 2.2 + index));
      }
    });

    hops.forEach((hop, index) => {
      const live = reveal >= 84;
      hop.mesh.visible = live;
      hop.line.visible = live;
      if (!live) return;
      const u = (((t * (4 + index)) / LOOP_SECONDS + index * 0.2) % 1 + 1) % 1;
      hop.curve.getPoint(u, hop.mesh.position);
    });
  };

  const loopActive = () => running && inView && tabVisible && !reducedMotion;

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
    frameCamera(width, height);
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
    getYaw: () => userYaw,
    setYaw: (radians: number) => {
      userYaw = radians;
      placeCamera();
      drawOnce();
    },
    getPitch: () => pitch,
    setPitch: (radians: number) => {
      pitch = clampPitch(radians);
      placeCamera();
      drawOnce();
    },
    getZoom: () => zoom,
    setZoom: (next: number) => {
      zoom = clampZoom(next);
      frameCamera(container.clientWidth, container.clientHeight);
      drawOnce();
    },
    setRunning: (next: boolean) => {
      running = next && !reducedMotion;
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
      const geometries = new Set<BufferGeometry>();
      const materials = new Set<MeshLambertMaterial | MeshStandardMaterial | LineBasicMaterial>();
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Line) {
          geometries.add(object.geometry);
          const list = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of list) {
            if (material instanceof MeshLambertMaterial || material instanceof MeshStandardMaterial || material instanceof LineBasicMaterial) {
              materials.add(material);
            }
          }
        }
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
