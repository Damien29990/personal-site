"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { animated, useSprings, useSpring, type SpringRef, type SpringValue } from "@react-spring/three";
import { Edges, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { voxelSitePalette as palette } from "@/scene/voxel-site/palette";
import { applyInstancedReveal } from "@/scene/voxel-site/instancing";
import {
  FLOOR_HEIGHT,
  TOWER_HALF,
  buildEntranceBlocks,
  buildGroundTiles,
  buildHoardingPosts,
  buildIotMarkers,
  buildMobileCrane,
  buildPodiumChunks,
  buildSteelChunks,
  buildTowerCrane,
  buildWorkers,
  type IotMarkerSpec,
  type PodiumChunk,
  type SteelChunk,
  type Vec3,
  type WorkerSpec,
} from "@/scene/voxel-site/layout";
import type { TimelineStore } from "@/scene/voxel-site/timeline";

type BuildingAssemblyModelProps = {
  store: TimelineStore;
};

// ---- Spring tuning --------------------------------------------------------
// One shared shape everywhere: `p` overshoots past 1 on the way in (a toy
// "pop and land"), and eases straight down to 0 on the way out (a clean,
// non-elastic rewind). No linear tweens anywhere in this file.
type PopState = { p: number };
type PopConfig = { mass?: number; tension: number; friction: number };

const ENTER_SPRING: PopConfig = { mass: 1, tension: 210, friction: 13 };
const ENTER_SPRING_HEAVY: PopConfig = { mass: 1.5, tension: 165, friction: 16 };
const ENTER_SPRING_SNAPPY: PopConfig = { mass: 0.8, tension: 260, friction: 11 };
const EXIT_SPRING: PopConfig = { mass: 1, tension: 340, friction: 32 };
const LOCK_SPRING: PopConfig = { mass: 1, tension: 130, friction: 9 };

const DROP_TALL = 2.6;
const DROP_SMALL = 1.1;
const RISE_WORKER = -0.32;

/** Advances one batched spring group toward whichever specs have crossed `reveal`. */
function syncBatch<T extends { revealAt: number }>(
  api: SpringRef<PopState>,
  specs: readonly T[],
  revealed: boolean[],
  reveal: number,
  snap: boolean,
  enterConfig: PopConfig = ENTER_SPRING,
): void {
  for (let i = 0; i < specs.length; i += 1) {
    const shouldReveal = reveal >= specs[i]!.revealAt;
    if (snap) {
      revealed[i] = shouldReveal;
      api.start((index) => (index === i ? { p: shouldReveal ? 1 : 0, immediate: true } : undefined));
      continue;
    }
    if (revealed[i] !== shouldReveal) {
      revealed[i] = shouldReveal;
      api.start((index) =>
        index === i ? { p: shouldReveal ? 1 : 0, config: shouldReveal ? enterConfig : EXIT_SPRING } : undefined,
      );
    }
  }
}

/** Same as `syncBatch`, for a single `useSpring` (not a `useSprings` batch). */
function syncSingle(
  api: SpringRef<PopState>,
  revealAt: number,
  revealed: { current: boolean },
  reveal: number,
  snap: boolean,
  enterConfig: PopConfig = ENTER_SPRING,
): void {
  const shouldReveal = reveal >= revealAt;
  if (snap) {
    revealed.current = shouldReveal;
    api.start({ p: shouldReveal ? 1 : 0, immediate: true });
    return;
  }
  if (revealed.current !== shouldReveal) {
    revealed.current = shouldReveal;
    api.start({ p: shouldReveal ? 1 : 0, config: shouldReveal ? enterConfig : EXIT_SPRING });
  }
}

/** Pop-in wrapper: scales 0→1 (with overshoot) and travels `drop` units on Y. */
function Pop({ p, drop = 0, children }: { p: SpringValue<number>; drop?: number; children: ReactNode }) {
  return (
    <animated.group scale={p} position-y={p.to((v) => (1 - v) * drop)}>
      {children}
    </animated.group>
  );
}

function BeamRing({ y, half, color }: { y: number; half: number; color: string }) {
  const span = half * 2 * 0.92;
  const t = 0.07;
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0, half]} castShadow>
        <boxGeometry args={[span, t, t]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, -half]} castShadow>
        <boxGeometry args={[span, t, t]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[half, 0, 0]} castShadow>
        <boxGeometry args={[t, t, span]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[-half, 0, 0]} castShadow>
        <boxGeometry args={[t, t, span]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </group>
  );
}

function PodiumChunkMesh({ chunk, p }: { chunk: PodiumChunk; p: SpringValue<number> }) {
  const width = TOWER_HALF * 2 * 0.94;
  return (
    <group position={[0, chunk.y0, 0]}>
      <Pop p={p} drop={DROP_TALL}>
        {Array.from({ length: chunk.floors }, (_, floor) => (
          <mesh key={floor} position={[0, floor * FLOOR_HEIGHT + FLOOR_HEIGHT / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, FLOOR_HEIGHT * 0.84, width]} />
            <meshLambertMaterial color={palette.curtainWall} />
            <Edges color={palette.curtainMullion} threshold={10} />
          </mesh>
        ))}
      </Pop>
    </group>
  );
}

function SteelChunkMesh({ chunk, p }: { chunk: SteelChunk; p: SpringValue<number> }) {
  const half = TOWER_HALF - 0.16;
  const height = chunk.y1 - chunk.y0;
  const corners: Vec3[] = [
    [half, 0, half],
    [half, 0, -half],
    [-half, 0, half],
    [-half, 0, -half],
  ];
  const deckHalf = TOWER_HALF * 1.06;
  return (
    <group position={[0, chunk.y0, 0]}>
      <Pop p={p} drop={DROP_TALL * 1.15}>
        {corners.map((corner, index) => (
          <mesh key={index} position={[corner[0], height / 2, corner[2]]} castShadow receiveShadow>
            <boxGeometry args={[0.22, height, 0.22]} />
            <meshLambertMaterial color={palette.steelDark} />
          </mesh>
        ))}
        {Array.from({ length: chunk.floors }, (_, floor) => (
          <BeamRing key={floor} y={floor * FLOOR_HEIGHT} half={TOWER_HALF - 0.1} color={palette.steelDark} />
        ))}
        {chunk.hasNet ? (
          <>
            <mesh position={[0, height / 2, TOWER_HALF - 0.08]} castShadow={false}>
              <planeGeometry args={[TOWER_HALF * 2 * 0.9, height * 0.94]} />
              <meshLambertMaterial color={palette.safetyNet} transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[TOWER_HALF - 0.08, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow={false}>
              <planeGeometry args={[TOWER_HALF * 2 * 0.9, height * 0.94]} />
              <meshLambertMaterial color={palette.safetyNet} transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          </>
        ) : null}
        {chunk.hasDeck ? (
          <mesh position={[0, height + 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[deckHalf * 2, 0.16, deckHalf * 2]} />
            <meshLambertMaterial color={palette.formwork} />
            <Edges color={palette.steelDark} threshold={10} />
          </mesh>
        ) : null}
      </Pop>
    </group>
  );
}

function Worker({ spec, p }: { spec: WorkerSpec; p: SpringValue<number> }) {
  return (
    <group position={spec.position}>
      <Pop p={p} drop={RISE_WORKER}>
        <mesh position={[0, 0.11, 0]} castShadow>
          <boxGeometry args={[0.16, 0.22, 0.13]} />
          <meshLambertMaterial color={palette.workerBody} />
        </mesh>
        <mesh position={[0, 0.37, 0]} castShadow>
          <boxGeometry args={[0.19, 0.3, 0.14]} />
          <meshLambertMaterial color={palette.workerBody} />
        </mesh>
        <mesh position={[0, 0.37, 0.075]} castShadow>
          <boxGeometry args={[0.16, 0.26, 0.02]} />
          <meshLambertMaterial color={palette.safetyYellow} />
        </mesh>
        <mesh position={[0, 0.59, 0]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshLambertMaterial color={palette.workerSkin} />
        </mesh>
        <mesh position={[0, 0.685, 0]} castShadow>
          <boxGeometry args={[0.18, 0.09, 0.18]} />
          <meshLambertMaterial color={palette.safetyYellow} />
        </mesh>
      </Pop>
    </group>
  );
}

function IotMarker({
  spec,
  p,
  revealed,
  onMaterialRef,
}: {
  spec: IotMarkerSpec;
  p: SpringValue<number>;
  revealed: boolean;
  onMaterialRef: (material: THREE.MeshLambertMaterial | null) => void;
}) {
  return (
    <group position={spec.position}>
      <animated.mesh scale={p}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshLambertMaterial
          ref={onMaterialRef}
          color={palette.accent}
          emissive={palette.accent}
          emissiveIntensity={0.6}
        />
      </animated.mesh>
      <Html center zIndexRange={[40, 0]} wrapperClass="pointer-events-none">
        <div
          className="pointer-events-none flex flex-col items-center gap-0.5 border border-fg bg-bg px-1.5 py-1 whitespace-nowrap transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            transform: `translateY(-1rem) scale(${revealed ? 1 : 0})`,
            opacity: revealed ? 1 : 0,
          }}
        >
          <p className="font-display text-[8px] leading-none tracking-[0.14em] text-accent">{spec.code}</p>
          <p className="font-display text-[7px] leading-none tracking-[0.12em] text-muted">{spec.label}</p>
        </div>
      </Html>
    </group>
  );
}

export default function BuildingAssemblyModel({ store }: BuildingAssemblyModelProps) {
  const groundTiles = useMemo(() => buildGroundTiles(), []);
  const hoardingPosts = useMemo(() => buildHoardingPosts(), []);
  const entranceBlocks = useMemo(() => buildEntranceBlocks(), []);
  const mobileCrane = useMemo(() => buildMobileCrane(), []);
  const podiumChunks = useMemo(() => buildPodiumChunks(), []);
  const steelChunks = useMemo(() => buildSteelChunks(), []);
  const towerCrane = useMemo(() => buildTowerCrane(), []);
  const workers = useMemo(() => buildWorkers(), []);
  const iotMarkers = useMemo(() => buildIotMarkers(), []);

  const outriggerSpecs = useMemo(
    () => mobileCrane.outriggers.map(() => ({ revealAt: mobileCrane.outriggerRevealAt })),
    [mobileCrane],
  );
  const mastSpecs = useMemo(
    () => towerCrane.sectionRevealAt.map((revealAt) => ({ revealAt })),
    [towerCrane],
  );

  const groundMeshRef = useRef<THREE.InstancedMesh>(null);
  const hoardingMeshRef = useRef<THREE.InstancedMesh>(null);
  const turntableRef = useRef<THREE.Group>(null);
  const jibGroupRef = useRef<THREE.Group>(null);
  const hookRef = useRef<THREE.Mesh>(null);
  const cableRef = useRef<THREE.Mesh>(null);

  const [entranceSprings, entranceApi] = useSprings(entranceBlocks.length, () => ({ p: 0 }), []);
  const entranceRevealed = useRef(entranceBlocks.map(() => false)).current;

  const [craneBodySpring, craneBodyApi] = useSpring(() => ({ p: 0 }), []);
  const craneBodyRevealed = useRef(false);

  const [outriggerSprings, outriggerApi] = useSprings(mobileCrane.outriggers.length, () => ({ p: 0 }), []);
  const outriggerRevealed = useRef(mobileCrane.outriggers.map(() => false)).current;

  const [podiumSprings, podiumApi] = useSprings(podiumChunks.length, () => ({ p: 0 }), []);
  const podiumRevealed = useRef(podiumChunks.map(() => false)).current;

  const [steelSprings, steelApi] = useSprings(steelChunks.length, () => ({ p: 0 }), []);
  const steelRevealed = useRef(steelChunks.map(() => false)).current;

  const [mastSprings, mastApi] = useSprings(towerCrane.sectionCount, () => ({ p: 0 }), []);
  const mastRevealed = useRef(new Array(towerCrane.sectionCount).fill(false)).current;

  const [cabSpring, cabApi] = useSpring(() => ({ p: 0 }), []);
  const cabRevealed = useRef(false);

  const [jibSpring, jibApi] = useSpring(() => ({ p: 0 }), []);
  const jibRevealed = useRef(false);

  const [workerSprings, workerApi] = useSprings(workers.length, () => ({ p: 0 }), []);
  const workerRevealed = useRef(workers.map(() => false)).current;

  const [iotSprings, iotApi] = useSprings(iotMarkers.length, () => ({ p: 0 }), []);
  const iotRevealed = useRef(iotMarkers.map(() => false)).current;

  const iotMaterialRefs = useRef<Array<THREE.MeshLambertMaterial | null>>(iotMarkers.map(() => null));
  const [iotHtmlVisible, setIotHtmlVisible] = useState<boolean[]>(() => iotMarkers.map(() => false));

  const [floatActive, setFloatActive] = useState(false);
  const completeRef = useRef(false);
  const spinFactorRef = useRef(0);
  const lastJumpToken = useRef(store.getSnapshot().jumpToken);

  useFrame((state, delta) => {
    const snapshot = store.tick(delta);
    const snap = snapshot.jumpToken !== lastJumpToken.current;
    lastJumpToken.current = snapshot.jumpToken;
    const reveal = snapshot.reveal;

    const groundMesh = groundMeshRef.current;
    if (groundMesh) applyInstancedReveal(groundMesh, groundTiles, reveal, 0.35, 1.1);
    const hoardingMesh = hoardingMeshRef.current;
    if (hoardingMesh) applyInstancedReveal(hoardingMesh, hoardingPosts, reveal, 0.3, 1.5);

    syncBatch(entranceApi, entranceBlocks, entranceRevealed, reveal, snap);
    syncSingle(craneBodyApi, mobileCrane.bodyRevealAt, craneBodyRevealed, reveal, snap, ENTER_SPRING_SNAPPY);
    syncBatch(outriggerApi, outriggerSpecs, outriggerRevealed, reveal, snap);
    syncBatch(podiumApi, podiumChunks, podiumRevealed, reveal, snap, ENTER_SPRING_HEAVY);
    syncBatch(steelApi, steelChunks, steelRevealed, reveal, snap, ENTER_SPRING_HEAVY);
    syncBatch(mastApi, mastSpecs, mastRevealed, reveal, snap, ENTER_SPRING_SNAPPY);
    syncSingle(cabApi, towerCrane.cabRevealAt, cabRevealed, reveal, snap);
    syncSingle(jibApi, towerCrane.jibRevealAt, jibRevealed, reveal, snap, LOCK_SPRING);
    syncBatch(workerApi, workers, workerRevealed, reveal, snap, ENTER_SPRING_SNAPPY);
    syncBatch(iotApi, iotMarkers, iotRevealed, reveal, snap, ENTER_SPRING_SNAPPY);

    // IoT HTML callouts mirror the dot springs, but as rare React state
    // (mount/unmount + CSS handles the "spring expand", see IotMarker).
    for (let i = 0; i < iotMarkers.length; i += 1) {
      const shouldShow = reveal >= iotMarkers[i]!.revealAt;
      if (iotHtmlVisible[i] !== shouldShow) {
        setIotHtmlVisible((prev) => {
          const next = prev.slice();
          next[i] = shouldShow;
          return next;
        });
      }
    }

    // Continuous IoT pulse — direct material mutation, same idiom as the
    // Hero diorama's sensors.
    const t = state.clock.elapsedTime;
    iotMaterialRefs.current.forEach((material, i) => {
      if (!material) return;
      material.emissiveIntensity = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2.4 + i * 1.7));
    });

    // Tower crane jib rotation-lock: swings from +90° to 0° with overshoot.
    const jibGroup = jibGroupRef.current;
    if (jibGroup) {
      jibGroup.rotation.y = (1 - jibSpring.p.get()) * (Math.PI / 2);
    }
    // Hook bob, only once the jib has settled near its resting position.
    const hook = hookRef.current;
    const cable = cableRef.current;
    if (hook && cable) {
      const jibSettled = jibSpring.p.get() > 0.6;
      hook.visible = jibSettled;
      cable.visible = jibSettled;
      if (jibSettled) {
        const drop = 1.6 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.9));
        hook.position.set(towerCrane.jibLength * 0.62, -drop, 0);
        cable.position.set(towerCrane.jibLength * 0.62, -drop / 2, 0);
        cable.scale.y = drop;
      }
    }

    // Auto-rotate + breathing only once fully assembled and holding.
    const targetSpin = snapshot.complete ? 1 : 0;
    spinFactorRef.current = THREE.MathUtils.damp(spinFactorRef.current, targetSpin, 3.2, delta);
    const turntable = turntableRef.current;
    if (turntable) {
      turntable.rotation.y += 0.09 * spinFactorRef.current * delta;
    }
    if (snapshot.complete !== completeRef.current) {
      completeRef.current = snapshot.complete;
      setFloatActive(snapshot.complete);
    }
  });

  return (
    <group ref={turntableRef}>
      <Float
        speed={1.1}
        rotationIntensity={floatActive ? 0.05 : 0}
        floatIntensity={floatActive ? 0.5 : 0}
        floatingRange={[-0.05, 0.05]}
      >
        <group>
          {/* Phase 01 — ground, hoarding, entrance, mobile crane -------- */}
          <instancedMesh ref={groundMeshRef} args={[undefined, undefined, groundTiles.length]} receiveShadow>
            <boxGeometry args={[0.58, 0.16, 0.58]} />
            <meshLambertMaterial color={palette.ground} />
          </instancedMesh>
          <instancedMesh ref={hoardingMeshRef} args={[undefined, undefined, hoardingPosts.length]} castShadow>
            <boxGeometry args={[0.1, 1.1, 0.1]} />
            <meshLambertMaterial color={palette.hoarding} />
          </instancedMesh>

          {entranceBlocks.map((block, index) => (
            <group key={index} position={[block.position[0], 0, block.position[2]]}>
              <Pop p={entranceSprings[index]!.p} drop={DROP_SMALL}>
                <mesh position={[0, block.size[1] / 2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[block.size[0], block.size[1], block.size[2]]} />
                  <meshLambertMaterial color={palette.concrete} />
                  <Edges color={palette.steelDark} threshold={10} />
                </mesh>
              </Pop>
            </group>
          ))}

          <group position={mobileCrane.restPosition}>
            <animated.group position-x={craneBodySpring.p.to((v) => (1 - v) * mobileCrane.startOffsetX)}>
              <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.5, 0.5, 0.85]} />
                <meshLambertMaterial color={palette.accent} />
                <Edges color={palette.steelDark} threshold={10} />
              </mesh>
              <mesh position={[0.15, 0.66, 0]} castShadow>
                <boxGeometry args={[0.5, 0.34, 0.7]} />
                <meshLambertMaterial color={palette.cabin} />
              </mesh>
              {[
                [0.55, 0.42],
                [-0.55, 0.42],
                [0.55, -0.42],
                [-0.55, -0.42],
              ].map(([wx, wz], index) => (
                <mesh key={index} position={[wx ?? 0, 0.1, wz ?? 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.1, 0.1, 0.14, 10]} />
                  <meshLambertMaterial color={palette.steelDark} />
                </mesh>
              ))}
              {mobileCrane.outriggers.map((offset, index) => (
                <animated.mesh
                  key={index}
                  scale={outriggerSprings[index]!.p}
                  position-x={outriggerSprings[index]!.p.to((v) => offset[0] * v)}
                  position-y={0.08}
                  position-z={outriggerSprings[index]!.p.to((v) => offset[2] * v)}
                  castShadow
                >
                  <boxGeometry args={[0.16, 0.16, 0.16]} />
                  <meshLambertMaterial color={palette.steelDark} />
                </animated.mesh>
              ))}
            </animated.group>
          </group>

          {/* Phase 02 — glazed podium, floor 01–25 ---------------------- */}
          {podiumChunks.map((chunk) => (
            <PodiumChunkMesh key={chunk.index} chunk={chunk} p={podiumSprings[chunk.index]!.p} />
          ))}

          {/* Phase 03 — steel frame, floor 26–40 ------------------------ */}
          {steelChunks.map((chunk) => (
            <SteelChunkMesh key={chunk.index} chunk={chunk} p={steelSprings[chunk.index]!.p} />
          ))}

          {/* Phase 04 — tower crane deployment --------------------------- */}
          <group position={towerCrane.base}>
            {Array.from({ length: towerCrane.sectionCount }, (_, index) => (
              <group key={index} position={[0, index * towerCrane.sectionHeight, 0]}>
                <Pop p={mastSprings[index]!.p} drop={DROP_TALL}>
                  <mesh position={[0, towerCrane.sectionHeight / 2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.42, towerCrane.sectionHeight * 0.92, 0.42]} />
                    <meshLambertMaterial color={palette.steelDark} />
                    <Edges color={palette.accent} threshold={10} />
                  </mesh>
                </Pop>
              </group>
            ))}

            <group position={[0, towerCrane.mastTopY, 0]}>
              <Pop p={cabSpring.p} drop={DROP_TALL * 1.3}>
                <mesh position={[0, 0.28, 0.05]} castShadow receiveShadow>
                  <boxGeometry args={[0.5, 0.46, 0.6]} />
                  <meshLambertMaterial color={palette.cabin} />
                  <Edges color={palette.steelDark} threshold={10} />
                </mesh>
                <group ref={jibGroupRef} position={[0, 0.56, 0]}>
                  <mesh position={[towerCrane.jibLength / 2, 0, 0]} castShadow>
                    <boxGeometry args={[towerCrane.jibLength, 0.16, 0.16]} />
                    <meshLambertMaterial color={palette.accent} />
                  </mesh>
                  <mesh position={[-towerCrane.counterJibLength / 2, 0, 0]} castShadow>
                    <boxGeometry args={[towerCrane.counterJibLength, 0.16, 0.16]} />
                    <meshLambertMaterial color={palette.accent} />
                  </mesh>
                  <mesh position={[-towerCrane.counterJibLength - 0.22, -0.08, 0]} castShadow>
                    <boxGeometry args={[0.32, 0.32, 0.32]} />
                    <meshLambertMaterial color={palette.steelDark} />
                  </mesh>
                  <mesh ref={hookRef} visible={false}>
                    <boxGeometry args={[0.16, 0.16, 0.16]} />
                    <meshLambertMaterial color={palette.steelDark} />
                  </mesh>
                  <mesh ref={cableRef} visible={false}>
                    <boxGeometry args={[0.05, 1, 0.05]} />
                    <meshLambertMaterial color={palette.steelDark} />
                  </mesh>
                </group>
              </Pop>
            </group>
          </group>

          {/* Phase 05 — personnel & IoT activation ----------------------- */}
          {workers.map((worker, index) => (
            <Worker key={worker.id} spec={worker} p={workerSprings[index]!.p} />
          ))}

          {iotMarkers.map((marker, index) => (
            <IotMarker
              key={marker.id}
              spec={marker}
              p={iotSprings[index]!.p}
              revealed={iotHtmlVisible[index] ?? false}
              onMaterialRef={(material) => {
                iotMaterialRefs.current[index] = material;
              }}
            />
          ))}
        </group>
      </Float>
    </group>
  );
}
