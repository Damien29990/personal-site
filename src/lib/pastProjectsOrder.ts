import { site, type ProjectItem } from "@/content/site";

export const PAST_PROJECTS_STORAGE_KEY = "past-projects-order";

const DEFAULT_ORDER = site.projects.map((project) => project.slug);
/** Stable reference — React requires getServerSnapshot to return cached data. */
const SERVER_SNAPSHOT = DEFAULT_ORDER;

let cachedOrder: string[] | null = null;
const listeners = new Set<() => void>();

function isValidOrder(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function readStoredOrder(): string[] {
  try {
    const raw = window.localStorage.getItem(PAST_PROJECTS_STORAGE_KEY);
    if (!raw) return DEFAULT_ORDER;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidOrder(parsed)) return DEFAULT_ORDER;
    const next = normalizeOrder(parsed);
    // Prefer the stable default reference when storage matches authored order.
    if (
      next.length === DEFAULT_ORDER.length &&
      next.every((slug, index) => slug === DEFAULT_ORDER[index])
    ) {
      return DEFAULT_ORDER;
    }
    return next;
  } catch {
    return DEFAULT_ORDER;
  }
}

/** Keep authored projects, drop unknown slugs, append any new ones. */
export function normalizeOrder(slugs: readonly string[]): string[] {
  const known = new Set<string>(DEFAULT_ORDER);
  const ordered: string[] = [];
  for (const slug of slugs) {
    if (known.has(slug) && !ordered.includes(slug)) ordered.push(slug);
  }
  for (const slug of DEFAULT_ORDER) {
    if (!ordered.includes(slug)) ordered.push(slug);
  }
  return ordered;
}

export function orderProjects(slugs: readonly string[]): ProjectItem[] {
  const bySlug = new Map<string, ProjectItem>(
    site.projects.map((project) => [project.slug, project]),
  );
  return normalizeOrder(slugs)
    .map((slug) => bySlug.get(slug))
    .filter((project): project is ProjectItem => project !== undefined);
}

export function subscribePastProjectsOrder(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getPastProjectsOrderSnapshot(): string[] {
  if (cachedOrder === null) {
    cachedOrder = typeof window === "undefined" ? SERVER_SNAPSHOT : readStoredOrder();
  }
  return cachedOrder;
}

export function getPastProjectsOrderServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

export function setPastProjectsOrder(slugs: readonly string[]): void {
  const next = normalizeOrder(slugs);
  cachedOrder =
    next.length === DEFAULT_ORDER.length &&
    next.every((slug, index) => slug === DEFAULT_ORDER[index])
      ? DEFAULT_ORDER
      : next;
  try {
    window.localStorage.setItem(PAST_PROJECTS_STORAGE_KEY, JSON.stringify(cachedOrder));
  } catch {
    // Session-only reorder is fine if storage is blocked.
  }
  for (const listener of listeners) listener();
}

export function resetPastProjectsOrder(): void {
  setPastProjectsOrder(DEFAULT_ORDER);
}
