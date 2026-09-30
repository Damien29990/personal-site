/** Reveal windows for the Hong Kong courtyard diorama. Play is 90s; teardown is separate. */

export const TOWERS = [
  { id: "A", x: -5.4, z: -1.5, floors: 9 },
  { id: "B", x: 0, z: 1.6, floors: 10 },
  { id: "C", x: 5.4, z: -1.5, floors: 8 },
] as const;

export const MAX_FLOORS = 10;
export const STOREY_HEIGHT = 0.78;

const FLOORS_FROM = 32;
const FLOORS_TO = 50;

export type RevealMode = "pop" | "unit";

export type RevealSpec = {
  name: string;
  from: number;
  to: number;
  mode: RevealMode;
};

export function storeyName(towerId: string, level: number): string {
  return `Tower${towerId}_Storey_${String(level).padStart(2, "0")}`;
}

export function floorReveal(level: number): { from: number; to: number } {
  const span = FLOORS_TO - FLOORS_FROM - 1.6;
  const from = FLOORS_FROM + (level / (MAX_FLOORS - 1)) * span;
  return { from, to: from + 1.6 };
}

export function revealSpecs(): RevealSpec[] {
  const specs: RevealSpec[] = [
    { name: "Ground", from: 0, to: 6, mode: "pop" },
    { name: "Hoarding", from: 2, to: 9, mode: "pop" },
    { name: "Foundation", from: 10, to: 20, mode: "pop" },
    { name: "Crane_Product", from: 22, to: 24, mode: "unit" },
    { name: "Bamboo", from: 52, to: 58, mode: "pop" },
    { name: "GreenNet", from: 54, to: 62, mode: "pop" },
    { name: "CatchFan", from: 56, to: 62, mode: "pop" },
    { name: "Alimak", from: 64, to: 70, mode: "pop" },
    { name: "Precast", from: 66, to: 72, mode: "pop" },
    { name: "MiC_Top", from: 68, to: 74, mode: "pop" },
    { name: "Guards", from: 70, to: 75, mode: "pop" },
    { name: "Workers", from: 74, to: 80, mode: "pop" },
    { name: "IoT", from: 76, to: 84, mode: "pop" },
  ];

  for (const tower of TOWERS) {
    specs.push({ name: `Tower${tower.id}_Core`, from: 32, to: 40, mode: "pop" });
    for (let level = 0; level < tower.floors; level += 1) {
      const window = floorReveal(level);
      specs.push({ name: storeyName(tower.id, level), ...window, mode: "pop" });
    }
  }

  return specs;
}
