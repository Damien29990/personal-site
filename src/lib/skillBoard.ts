import { site } from "@/content/site";

export const FLOOR_GROUP = "__floor__";

export type SkillColumn = {
  group: string;
  items: string[];
};

export type SkillBoardState = {
  shelves: SkillColumn[];
  floor: string[];
};

export function defaultSkillBoard(): SkillColumn[] {
  return site.skills.map((column) => ({
    group: column.group,
    items: [...column.items],
  }));
}

export function defaultSkillBoardState(): SkillBoardState {
  return { shelves: defaultSkillBoard(), floor: [] };
}

export function homeGroupOf(name: string): string | undefined {
  return site.skills.find((column) =>
    (column.items as readonly string[]).includes(name),
  )?.group;
}

export function isCanonicalSkillBoard(state: SkillBoardState): boolean {
  if (state.floor.length > 0) return false;
  if (state.shelves.length !== site.skills.length) return false;
  return site.skills.every((column, index) => {
    const current = state.shelves[index];
    if (!current || current.group !== column.group) return false;
    if (current.items.length !== column.items.length) return false;
    return current.items.every((item, itemIndex) => item === column.items[itemIndex]);
  });
}

function cloneState(state: SkillBoardState): SkillBoardState {
  return {
    shelves: state.shelves.map((column) => ({
      group: column.group,
      items: [...column.items],
    })),
    floor: [...state.floor],
  };
}

export function placeSkill(
  state: SkillBoardState,
  name: string,
  fromGroup: string,
  toGroup: string,
  toIndex: number,
): SkillBoardState {
  const next = cloneState(state);
  let fromIndex = -1;

  if (fromGroup === FLOOR_GROUP) {
    fromIndex = next.floor.indexOf(name);
    if (fromIndex < 0) return state;
    next.floor.splice(fromIndex, 1);
  } else {
    const fromColumn = next.shelves.find((column) => column.group === fromGroup);
    if (!fromColumn) return state;
    fromIndex = fromColumn.items.indexOf(name);
    if (fromIndex < 0) return state;
    fromColumn.items.splice(fromIndex, 1);
  }

  let insertAt = toIndex;
  if (fromGroup === toGroup && fromIndex < toIndex) insertAt -= 1;

  if (toGroup === FLOOR_GROUP) {
    insertAt = Math.max(0, Math.min(insertAt, next.floor.length));
    if (!next.floor.includes(name)) next.floor.splice(insertAt, 0, name);
    return next;
  }

  const toColumn = next.shelves.find((column) => column.group === toGroup);
  if (!toColumn) return state;
  insertAt = Math.max(0, Math.min(insertAt, toColumn.items.length));
  toColumn.items.splice(insertAt, 0, name);
  return next;
}

export function dropToFloor(state: SkillBoardState, names: readonly string[]): SkillBoardState {
  let next = state;
  for (const name of names) {
    const fromGroup = next.shelves.find((column) => column.items.includes(name))?.group;
    if (!fromGroup) continue;
    next = placeSkill(next, name, fromGroup, FLOOR_GROUP, next.floor.length);
  }
  return next;
}

export function pickShakeDrops(state: SkillBoardState, count: number): string[] {
  const pool = state.shelves.flatMap((column) => column.items);
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = pool[index]!;
    pool[index] = pool[swap]!;
    pool[swap] = current;
  }
  return pool.slice(0, Math.min(count, pool.length));
}
