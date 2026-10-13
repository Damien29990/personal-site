"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { TagChipIcon } from "@/components/TagChip";
import {
  defaultSkillBoardState,
  dropToFloor,
  FLOOR_GROUP,
  homeGroupOf,
  isCanonicalSkillBoard,
  pickShakeDrops,
  placeSkill,
  type SkillBoardState,
  type SkillColumn,
} from "@/lib/skillBoard";

type DragSource = {
  name: string;
  group: string;
};

type DropTarget = {
  group: string;
  index: number;
};

type RectSnap = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Landing on the platform, relative to `.book-platform-row`. */
type FloorSpot = {
  left: number;
  bottom: number;
  /** Final rest angle in degrees. */
  angle: number;
  /** Flat = knocked over on its side after a collision. */
  pose: "upright" | "flat";
};

function randomPose(): Pick<FloorSpot, "angle" | "pose"> {
  // Chaotic drops: many books tip over; the rest lean at odd upright angles.
  if (Math.random() < 0.55) {
    const side = Math.random() < 0.5 ? -1 : 1;
    return { pose: "flat", angle: side * (72 + Math.random() * 36) };
  }
  const side = Math.random() < 0.5 ? -1 : 1;
  return { pose: "upright", angle: side * (6 + Math.random() * 28) };
}

function planFloorSpots(
  names: readonly string[],
  origins: Record<string, RectSnap>,
  platform: DOMRect,
  existing: Record<string, FloorSpot>,
): Record<string, FloorSpot> {
  const next = { ...existing };

  for (const name of names) {
    const origin = origins[name];
    if (!origin) continue;
    const width = Math.max(origin.width, 14);
    const scatter = (Math.random() * 2 - 1) * 28;
    let left = origin.left - platform.left + scatter;
    left = Math.max(4, Math.min(left, Math.max(4, platform.width - width - 4)));
    let bottom = 6 + Math.random() * 10;
    const pose = randomPose();

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const overlaps = Object.entries(next).some(([other, spot]) => {
        if (other === name) return false;
        const otherWidth = origins[other]?.width ?? 18;
        const pad = spot.pose === "flat" || pose.pose === "flat" ? 0.85 : 0.55;
        return Math.abs(spot.left - left) < (width + otherWidth) * pad && Math.abs(spot.bottom - bottom) < 22;
      });
      if (!overlaps) break;
      // Collision response: kick sideways, then pile.
      if (attempt < 6) {
        left += (Math.random() < 0.5 ? -1 : 1) * (width * (0.4 + Math.random() * 0.5));
        left = Math.max(4, Math.min(left, platform.width - width - 4));
      } else {
        bottom += 12 + Math.random() * 10;
      }
    }

    next[name] = { left, bottom, ...pose };
  }

  return next;
}

const RESET_SPECKS = [
  { dx: "-36px", dy: "-42px" },
  { dx: "40px", dy: "-28px" },
  { dx: "46px", dy: "24px" },
  { dx: "-42px", dy: "34px" },
  { dx: "8px", dy: "-52px" },
  { dx: "-12px", dy: "48px" },
  { dx: "52px", dy: "4px" },
  { dx: "-50px", dy: "-8px" },
  { dx: "28px", dy: "44px" },
  { dx: "-30px", dy: "-22px" },
] as const;

const FALL_MS = 780;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function bookTone(name: string): 0 | 1 | 2 | 3 | 4 | 5 {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash += name.charCodeAt(i) * (i + 1);
  return (hash % 6) as 0 | 1 | 2 | 3 | 4 | 5;
}

/** Slim spines so a packed bay stays one shelf row. */
function bookMetrics(name: string): { width: string; height: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash += name.charCodeAt(i) * (i + 3);
  const width = 1.05 + (hash % 4) * 0.08 + Math.min(name.length, 10) * 0.012;
  const height = 5.1 + (hash % 3) * 0.28;
  return { width: `${width}rem`, height: `${height}rem` };
}

function tiltFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * (i + 1)) % 11;
  return (hash % 2 === 0 ? 1 : -1) * (4 + (hash % 8));
}

function shelfPairs(shelves: SkillColumn[]): Array<[SkillColumn | undefined, SkillColumn | undefined]> {
  const pairs: Array<[SkillColumn | undefined, SkillColumn | undefined]> = [];
  for (let index = 0; index < 8; index += 2) {
    pairs.push([shelves[index], shelves[index + 1]]);
  }
  return pairs;
}

function ResetTagsButton({
  onStart,
  onRestore,
  onFinished,
}: {
  onStart: () => void;
  onRestore: () => void;
  onFinished: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "loading" | "poof">("idle");
  const busy = phase !== "idle";

  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setTimeout(() => {
      onRestore();
      setPhase("poof");
    }, 520);
    return () => window.clearTimeout(id);
  }, [phase, onRestore]);

  useEffect(() => {
    if (phase !== "poof") return;
    const id = window.setTimeout(() => onFinished(), 640);
    return () => window.clearTimeout(id);
  }, [phase, onFinished]);

  return (
    <button
      type="button"
      onClick={() => {
        if (busy) return;
        onStart();
        if (prefersReducedMotion()) {
          onRestore();
          onFinished();
          return;
        }
        setPhase("loading");
      }}
      disabled={busy}
      aria-busy={busy}
      aria-label="Reset books to their shelves"
      title="Reset"
      className={`reset-btn inline-flex h-8 w-8 shrink-0 items-center justify-center border border-header text-header ${
        phase === "loading" ? "is-loading" : ""
      } ${phase === "poof" ? "is-poof" : ""}`}
    >
      <svg className="reset-icon h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M3 3v5h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      <span className="reset-dust" aria-hidden="true">
        {RESET_SPECKS.map((speck, index) => (
          <i
            key={index}
            style={{
              ["--dx" as string]: speck.dx,
              ["--dy" as string]: speck.dy,
              ["--i" as string]: String(index),
            }}
          />
        ))}
      </span>
    </button>
  );
}

function SkillBook({
  name,
  group,
  index,
  fallen,
  falling,
  returning,
  dragging,
  dropTarget,
  floorSpot,
  registerEl,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveWithKeyboard,
  onNudgeOff,
}: {
  name: string;
  group: string;
  index: number;
  fallen: boolean;
  falling: boolean;
  returning: boolean;
  dragging: boolean;
  dropTarget: boolean;
  floorSpot?: FloorSpot;
  registerEl: (name: string, node: HTMLButtonElement | null) => void;
  onDragStart: (name: string, group: string) => void;
  onDragOver: (event: ReactDragEvent<HTMLButtonElement>, group: string, index: number) => void;
  onDrop: (group: string, index: number) => void;
  onDragEnd: () => void;
  onMoveWithKeyboard: (name: string, group: string, key: string) => void;
  onNudgeOff: () => void;
}) {
  const home = homeGroupOf(name);
  const tone = bookTone(name);
  const metrics = bookMetrics(name);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      onMoveWithKeyboard(name, group, event.key);
    }
  };

  return (
    <li
      className={fallen ? "skill-book-slot is-floor" : "skill-book-slot"}
      style={
        fallen && floorSpot
          ? { left: floorSpot.left, bottom: floorSpot.bottom }
          : undefined
      }
    >
      <button
        type="button"
        ref={(node) => {
          buttonRef.current = node;
          registerEl(name, node);
        }}
        draggable
        data-book={name}
        onKeyDown={onKeyDown}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", name);
          onDragStart(name, group);
        }}
        onDoubleClick={() => {
          if (!fallen) onNudgeOff();
        }}
        onDragOver={(event) => onDragOver(event, group, index)}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDrop(group, index);
        }}
        onDragEnd={onDragEnd}
        aria-grabbed={dragging}
        aria-label={`${name}. ${fallen ? "On the floor" : `On the ${home ?? group} shelf`}. Drag onto a shelf, or shake the case to drop books.`}
        className={`skill-book skill-book-tone-${tone} ${fallen ? "is-fallen" : "is-shelf"} ${
          fallen && floorSpot?.pose === "flat" && !dragging ? "is-flat" : ""
        } ${falling ? "is-falling" : ""} ${returning ? "is-returning" : ""} ${
          dragging ? "is-dragging" : ""
        } ${dropTarget ? "is-drop-target" : ""}`}
        style={{
          height: metrics.height,
          ...(fallen
            ? {
                width: metrics.width,
                ["--book-tilt" as string]: `${
                  dragging ? 0 : (floorSpot?.angle ?? tiltFor(name))
                }deg`,
              }
            : {
                ["--book-tilt" as string]: "0deg",
              }),
        }}
      >
        <span className="skill-book-mark">
          <TagChipIcon name={name} size={fallen ? 14 : 12} />
        </span>
        <span className="skill-book-title">{name}</span>
      </button>
    </li>
  );
}

function LibraryBay({
  column,
  hintId,
  over,
  dragName,
  returning,
  fallingNames,
  registerEl,
  onDragOverGroup,
  onDragLeaveGroup,
  onDropBay,
  onDragStart,
  onDragOverBook,
  onDropBook,
  onDragEnd,
  onMoveWithKeyboard,
  onNudgeOff,
}: {
  column: SkillColumn | undefined;
  hintId: string;
  over: DropTarget | null;
  dragName: string | null;
  returning: boolean;
  fallingNames: ReadonlySet<string>;
  registerEl: (name: string, node: HTMLButtonElement | null) => void;
  onDragOverGroup: (event: ReactDragEvent<HTMLElement>, group: string, index: number) => void;
  onDragLeaveGroup: (group: string) => void;
  onDropBay: (column: SkillColumn) => void;
  onDragStart: (name: string, group: string) => void;
  onDragOverBook: (event: ReactDragEvent<HTMLButtonElement>, group: string, index: number) => void;
  onDropBook: (group: string, index: number) => void;
  onDragEnd: () => void;
  onMoveWithKeyboard: (name: string, group: string, key: string) => void;
  onNudgeOff: (name: string, group: string) => void;
}) {
  if (!column) {
    return (
      <section className="library-bay is-empty" aria-hidden="true">
        <div className="library-row" />
        <p className="library-board">&nbsp;</p>
      </section>
    );
  }

  const groupActive = over?.group === column.group;
  const count = Math.max(column.items.length, 1);

  return (
    <section
      onDragOver={(event) => onDragOverGroup(event, column.group, column.items.length)}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        onDragLeaveGroup(column.group);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropBay(column);
      }}
      className={`library-bay ${groupActive ? "is-active" : ""}`}
      aria-label={column.group}
      style={{ ["--bay-count" as string]: String(count) }}
    >
      <ul className="library-row" aria-describedby={hintId}>
        {column.items.map((name, index) => (
          <SkillBook
            key={name}
            name={name}
            group={column.group}
            index={index}
            fallen={false}
            falling={fallingNames.has(name)}
            returning={returning}
            dragging={dragName === name}
            dropTarget={over?.group === column.group && over.index === index && dragName !== name}
            registerEl={registerEl}
            onDragStart={onDragStart}
            onDragOver={onDragOverBook}
            onDrop={onDropBook}
            onDragEnd={onDragEnd}
            onMoveWithKeyboard={onMoveWithKeyboard}
            onNudgeOff={() => onNudgeOff(name, column.group)}
          />
        ))}
      </ul>
      <p className="library-board">{column.group}</p>
    </section>
  );
}

export function SkillBoard() {
  const hintId = useId();
  const rigRef = useRef<HTMLDivElement>(null);
  const platformRowRef = useRef<HTMLUListElement>(null);
  const bookEls = useRef(new Map<string, HTMLButtonElement>());
  const pendingOrigins = useRef<Record<string, RectSnap>>({});
  const floorSpotsRef = useRef<Record<string, FloorSpot>>({});
  const shakeRef = useRef({
    pointerId: -1,
    lastX: 0,
    lastY: 0,
    originX: 0,
    originY: 0,
    energy: 0,
    samples: [] as { t: number; x: number; y: number }[],
    cooling: false,
  });
  const [board, setBoard] = useState<SkillBoardState>(defaultSkillBoardState);
  const [drag, setDrag] = useState<DragSource | null>(null);
  const [over, setOver] = useState<DropTarget | null>(null);
  const [falling, setFalling] = useState<ReadonlySet<string>>(() => new Set());
  const [floorSpots, setFloorSpots] = useState<Record<string, FloorSpot>>({});
  const dropCommitted = useRef(false);
  const [rattling, setRattling] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [returning, setReturning] = useState(false);
  const messy = !isCanonicalSkillBoard(board);

  useEffect(() => {
    floorSpotsRef.current = floorSpots;
  }, [floorSpots]);

  const registerEl = useCallback((name: string, node: HTMLButtonElement | null) => {
    if (node) bookEls.current.set(name, node);
    else bookEls.current.delete(name);
  }, []);

  const captureOrigins = useCallback((names: readonly string[]) => {
    const snaps: Record<string, RectSnap> = {};
    for (const name of names) {
      const el = bookEls.current.get(name);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      snaps[name] = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    pendingOrigins.current = { ...pendingOrigins.current, ...snaps };
    return snaps;
  }, []);

  const animatedFalls = useRef(new Set<string>());

  const restoreBoard = useCallback(() => {
    setFalling(new Set());
    pendingOrigins.current = {};
    floorSpotsRef.current = {};
    animatedFalls.current.clear();
    setFloorSpots({});
    setReturning(true);
    setBoard(defaultSkillBoardState());
    window.setTimeout(() => setReturning(false), 520);
  }, []);

  const markFalling = useCallback(
    (names: readonly string[]) => {
      if (names.length === 0) return;
      const snaps = captureOrigins(names);
      const platform = platformRowRef.current?.getBoundingClientRect();
      if (platform) {
        const planned = planFloorSpots(names, snaps, platform, floorSpotsRef.current);
        floorSpotsRef.current = planned;
        setFloorSpots(planned);
      }
      setFalling((current) => {
        const next = new Set(current);
        for (const name of names) next.add(name);
        return next;
      });
      window.setTimeout(() => {
        setFalling((current) => {
          const next = new Set(current);
          for (const name of names) {
            next.delete(name);
            animatedFalls.current.delete(name);
          }
          return next;
        });
        for (const name of names) delete pendingOrigins.current[name];
      }, FALL_MS + 160);
    },
    [captureOrigins],
  );

  // FLIP once per drop. Re-running this effect (new books, Strict Mode) must not replay books already in flight.
  useLayoutEffect(() => {
    if (falling.size === 0 || prefersReducedMotion()) return;
    const cleanups: Array<() => void> = [];

    for (const name of falling) {
      if (animatedFalls.current.has(name)) continue;
      const from = pendingOrigins.current[name];
      const el = bookEls.current.get(name);
      const spot = floorSpotsRef.current[name];
      if (!from || !el) continue;

      animatedFalls.current.add(name);
      const to = el.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      const angle = spot?.angle ?? tiltFor(name);
      const spinIn = angle > 0 ? -22 : 22;
      let started = false;

      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${spinIn}deg)`;
      el.style.zIndex = "40";
      el.style.willChange = "transform";

      const start = () => {
        if (started) return;
        started = true;
        el.style.transition = `transform ${FALL_MS}ms cubic-bezier(0.2, 0.78, 0.28, 1)`;
        el.style.transform = `rotate(${angle}deg)`;
      };

      const raf = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(start);
      });

      const onEnd = (event: TransitionEvent) => {
        if (event.target !== el || event.propertyName !== "transform") return;
        el.style.transition = "";
        el.style.willChange = "";
        el.style.zIndex = "";
        el.style.transform = "";
      };
      el.addEventListener("transitionend", onEnd);

      cleanups.push(() => {
        window.cancelAnimationFrame(raf);
        el.removeEventListener("transitionend", onEnd);
        if (!started) animatedFalls.current.delete(name);
      });
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [falling, board.floor]);

  const straightenFloorBook = useCallback((name: string) => {
    setFloorSpots((current) => {
      const spot = current[name];
      if (!spot || (spot.pose === "upright" && spot.angle === 0)) return current;
      const next = {
        ...current,
        [name]: { ...spot, pose: "upright" as const, angle: 0 },
      };
      floorSpotsRef.current = next;
      return next;
    });
  }, []);

  const boardRef = useRef(board);
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const dropBooks = useCallback(
    (count: number) => {
      const current = boardRef.current;
      const names = pickShakeDrops(current, count);
      if (names.length === 0) return;
      markFalling(names);
      boardRef.current = dropToFloor(current, names);
      setBoard((latest) => dropToFloor(latest, names));
    },
    [markFalling],
  );

  const tryShakeDrop = useCallback(
    (energy: number) => {
      const motion = shakeRef.current;
      if (motion.cooling) return;
      let count = 0;
      if (energy > 140) count = 5;
      else if (energy > 90) count = 3;
      else if (energy > 48) count = 2;
      else if (energy > 22) count = 1;
      if (count === 0) return;
      motion.cooling = true;
      motion.energy = 0;
      motion.samples = [];
      if (rigRef.current) rigRef.current.style.transform = "";
      setRattling(true);
      window.setTimeout(() => dropBooks(count), 260);
      window.setTimeout(() => {
        motion.cooling = false;
        setRattling(false);
      }, 720);
    },
    [dropBooks],
  );

  const onPointerDownRig = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".skill-book")) return;
    const Motion = DeviceMotionEvent as typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<string>;
    };
    if (typeof Motion.requestPermission === "function") {
      void Motion.requestPermission();
    }
    const motion = shakeRef.current;
    motion.pointerId = event.pointerId;
    motion.lastX = event.clientX;
    motion.lastY = event.clientY;
    motion.originX = event.clientX;
    motion.originY = event.clientY;
    motion.energy = 0;
    motion.samples = [{ t: performance.now(), x: event.clientX, y: event.clientY }];
    event.currentTarget.classList.add("is-grabbing");
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMoveRig = (event: ReactPointerEvent<HTMLDivElement>) => {
    const motion = shakeRef.current;
    if (motion.pointerId !== event.pointerId) return;
    const dx = event.clientX - motion.lastX;
    const dy = event.clientY - motion.lastY;
    motion.lastX = event.clientX;
    motion.lastY = event.clientY;
    const now = performance.now();
    motion.samples.push({ t: now, x: event.clientX, y: event.clientY });
    motion.samples = motion.samples.filter((sample) => now - sample.t < 420);
    motion.energy += Math.hypot(dx, dy);
    const offsetX = Math.max(-14, Math.min(14, event.clientX - motion.originX));
    const offsetY = Math.max(-10, Math.min(10, event.clientY - motion.originY));
    const rig = rigRef.current;
    if (rig && !prefersReducedMotion()) {
      rig.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
    tryShakeDrop(motion.energy);
  };

  const endShakePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const motion = shakeRef.current;
    if (motion.pointerId !== event.pointerId) return;
    motion.pointerId = -1;
    motion.energy = 0;
    motion.samples = [];
    const rig = rigRef.current;
    if (rig) {
      rig.style.transform = "";
      rig.classList.remove("is-grabbing");
    }
  };

  useEffect(() => {
    const onMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.hypot(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0);
      if (magnitude > 12) tryShakeDrop(70);
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [tryShakeDrop]);

  const place = useCallback(
    (name: string, fromGroup: string, toGroup: string, toIndex: number) => {
      if (fromGroup === FLOOR_GROUP && toGroup !== FLOOR_GROUP) {
        setFloorSpots((current) => {
          if (!(name in current)) return current;
          const next = { ...current };
          delete next[name];
          floorSpotsRef.current = next;
          return next;
        });
      }
      setBoard((current) => {
        const next = placeSkill(current, name, fromGroup, toGroup, toIndex);
        boardRef.current = next;
        return next;
      });
    },
    [],
  );

  const dropNamed = useCallback(
    (name: string, fromGroup: string) => {
      if (fromGroup === FLOOR_GROUP) return;
      markFalling([name]);
      place(name, fromGroup, FLOOR_GROUP, boardRef.current.floor.length);
    },
    [markFalling, place],
  );

  const onDragOverBook = useCallback(
    (event: ReactDragEvent<HTMLButtonElement>, group: string, index: number) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      setOver({ group, index });
    },
    [],
  );

  const onDragOverGroup = useCallback(
    (event: ReactDragEvent<HTMLElement>, group: string, index: number) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setOver({ group, index });
    },
    [],
  );

  const finishDrop = useCallback(
    (group: string, index: number) => {
      dropCommitted.current = true;
      if (drag) {
        if (group === FLOOR_GROUP && drag.group !== FLOOR_GROUP) {
          markFalling([drag.name]);
        }
        place(drag.name, drag.group, group, index);
      }
      setDrag(null);
      setOver(null);
    },
    [drag, markFalling, place],
  );

  const clearDrag = useCallback(() => {
    if (!dropCommitted.current && drag && drag.group !== FLOOR_GROUP) {
      dropNamed(drag.name, drag.group);
    }
    dropCommitted.current = false;
    setDrag(null);
    setOver(null);
  }, [drag, dropNamed]);

  const onMoveWithKeyboard = useCallback(
    (name: string, group: string, key: string) => {
      if (group === FLOOR_GROUP) {
        const index = board.floor.indexOf(name);
        if (index < 0) return;
        if (key === "ArrowLeft" && index > 0) {
          place(name, FLOOR_GROUP, FLOOR_GROUP, index - 1);
          return;
        }
        if (key === "ArrowRight" && index < board.floor.length - 1) {
          place(name, FLOOR_GROUP, FLOOR_GROUP, index + 2);
          return;
        }
        if (key === "ArrowUp") {
          const home = homeGroupOf(name);
          if (home) {
            const shelf = board.shelves.find((column) => column.group === home);
            place(name, FLOOR_GROUP, home, shelf?.items.length ?? 0);
          }
        }
        return;
      }

      const columnIndex = board.shelves.findIndex((column) => column.group === group);
      const column = board.shelves[columnIndex];
      if (!column) return;
      const index = column.items.indexOf(name);
      if (index < 0) return;

      if (key === "ArrowLeft" && index > 0) {
        place(name, group, group, index - 1);
        return;
      }
      if (key === "ArrowRight" && index < column.items.length - 1) {
        place(name, group, group, index + 2);
        return;
      }
      if (key === "ArrowDown") {
        dropNamed(name, group);
        return;
      }
      if (key === "ArrowUp" && columnIndex > 0) {
        const target = board.shelves[columnIndex - 1];
        if (target) place(name, group, target.group, Math.min(index, target.items.length));
      }
    },
    [board, dropNamed, place],
  );

  return (
    <div>
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-3 overflow-visible">
        <p id={hintId} className="max-w-xl text-sm text-muted">
          Shake the case, drag a book off a shelf, or double-click it — books fall to the platform.
          Drag them back onto a class.
        </p>
        {messy || resetting ? (
          <ResetTagsButton
            onStart={() => setResetting(true)}
            onRestore={restoreBoard}
            onFinished={() => setResetting(false)}
          />
        ) : null}
      </div>

      <div
        ref={rigRef}
        className={`bookshelf-rig mt-6 ${rattling ? "is-rattling" : ""}`}
        onPointerDown={onPointerDownRig}
        onPointerMove={onPointerMoveRig}
        onPointerUp={endShakePointer}
        onPointerCancel={endShakePointer}
      >
        <div className="library-case">
          <div className="library-crown" aria-hidden="true" />
          <div className="library-body">
            {shelfPairs(board.shelves).map(([left, right], layer) => (
              <div key={`layer-${layer}`} className="library-layer">
                <LibraryBay
                  column={left}
                  hintId={hintId}
                  over={over}
                  dragName={drag?.name ?? null}
                  returning={returning}
                  fallingNames={falling}
                  registerEl={registerEl}
                  onDragOverGroup={onDragOverGroup}
                  onDragLeaveGroup={(group) => {
                    setOver((current) => (current?.group === group ? null : current));
                  }}
                  onDropBay={(column) => {
                    finishDrop(
                      column.group,
                      over?.group === column.group ? over.index : column.items.length,
                    );
                  }}
                  onDragStart={(tagName, tagGroup) => {
                    dropCommitted.current = false;
                    setDrag({ name: tagName, group: tagGroup });
                  }}
                  onDragOverBook={onDragOverBook}
                  onDropBook={finishDrop}
                  onDragEnd={clearDrag}
                  onMoveWithKeyboard={onMoveWithKeyboard}
                  onNudgeOff={dropNamed}
                />
                <div className="library-mullion" aria-hidden="true" />
                <LibraryBay
                  column={right}
                  hintId={hintId}
                  over={over}
                  dragName={drag?.name ?? null}
                  returning={returning}
                  fallingNames={falling}
                  registerEl={registerEl}
                  onDragOverGroup={onDragOverGroup}
                  onDragLeaveGroup={(group) => {
                    setOver((current) => (current?.group === group ? null : current));
                  }}
                  onDropBay={(column) => {
                    finishDrop(
                      column.group,
                      over?.group === column.group ? over.index : column.items.length,
                    );
                  }}
                  onDragStart={(tagName, tagGroup) => {
                    dropCommitted.current = false;
                    setDrag({ name: tagName, group: tagGroup });
                  }}
                  onDragOverBook={onDragOverBook}
                  onDropBook={finishDrop}
                  onDragEnd={clearDrag}
                  onMoveWithKeyboard={onMoveWithKeyboard}
                  onNudgeOff={dropNamed}
                />
              </div>
            ))}
          </div>
          <div className="library-plinth" aria-hidden="true" />
        </div>
      </div>

      <div
        className={`book-platform mt-8 ${over?.group === FLOOR_GROUP ? "is-active" : ""}`}
        onDragOver={(event) => onDragOverGroup(event, FLOOR_GROUP, board.floor.length)}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setOver((current) => (current?.group === FLOOR_GROUP ? null : current));
        }}
        onDrop={(event) => {
          event.preventDefault();
          finishDrop(FLOOR_GROUP, over?.group === FLOOR_GROUP ? over.index : board.floor.length);
        }}
      >
        <div className="book-platform-sphere" aria-hidden="true" />
        <div className="book-platform-deck">
          <ul
            ref={platformRowRef}
            className="book-platform-row"
            aria-label="Fallen books"
          >
            {board.floor.map((name, index) => (
                <SkillBook
                  key={name}
                  name={name}
                  group={FLOOR_GROUP}
                  index={index}
                  fallen
                  falling={falling.has(name)}
                  returning={false}
                  dragging={drag?.name === name}
                  dropTarget={
                    over?.group === FLOOR_GROUP && over.index === index && drag?.name !== name
                  }
                  floorSpot={floorSpots[name]}
                  registerEl={registerEl}
                  onDragStart={(tagName, tagGroup) => {
                    dropCommitted.current = false;
                    straightenFloorBook(tagName);
                    setDrag({ name: tagName, group: tagGroup });
                  }}
                  onDragOver={onDragOverBook}
                  onDrop={finishDrop}
                  onDragEnd={clearDrag}
                  onMoveWithKeyboard={onMoveWithKeyboard}
                  onNudgeOff={() => undefined}
                />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
