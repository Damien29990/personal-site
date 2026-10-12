"use client";

import {
  useCallback,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { TechStack } from "@/components/TechStack";
import type { ProjectItem } from "@/content/site";
import { withBasePath } from "@/lib/paths";
import {
  getPastProjectsOrderServerSnapshot,
  getPastProjectsOrderSnapshot,
  orderProjects,
  resetPastProjectsOrder,
  setPastProjectsOrder,
  subscribePastProjectsOrder,
} from "@/lib/pastProjectsOrder";

function indexLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function ProjectCard({
  project,
  index,
  dragging,
  dropTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveWithKeyboard,
}: {
  project: ProjectItem;
  index: number;
  dragging: boolean;
  dropTarget: boolean;
  onDragStart: (slug: string) => void;
  onDragOver: (event: ReactDragEvent<HTMLElement>, slug: string) => void;
  onDragLeave: () => void;
  onDrop: (slug: string) => void;
  onDragEnd: () => void;
  onMoveWithKeyboard: (slug: string, direction: -1 | 1) => void;
}) {
  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      onMoveWithKeyboard(project.slug, -1);
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      onMoveWithKeyboard(project.slug, 1);
    }
  };

  return (
    <article
      draggable
      tabIndex={0}
      onKeyDown={onKeyDown}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", project.slug);
        onDragStart(project.slug);
      }}
      onDragOver={(event) => onDragOver(event, project.slug)}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(project.slug);
      }}
      onDragEnd={onDragEnd}
      aria-grabbed={dragging}
      aria-label={`${project.name}. Drag to reorder, or use arrow keys when focused.`}
      className={`group relative cursor-grab border-t border-line pt-5 active:cursor-grabbing ${
        dragging ? "opacity-45" : ""
      } ${dropTarget ? "border-t-accent" : ""}`}
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
      />
      <p className="mb-3 font-display text-[10px] uppercase tracking-[0.16em] text-muted">
        Drag to reorder · ← → when focused
      </p>
      <div className="overflow-hidden border border-fg bg-surface">
        <img
          src={withBasePath(project.image)}
          alt=""
          className="aspect-[16/10] w-full object-cover"
          draggable={false}
        />
      </div>
      <p className="mt-5 font-display text-[11px] uppercase tracking-[0.18em] text-accent">
        {indexLabel(index)} · {project.type}
      </p>
      <h3 className="mt-2 font-display text-2xl uppercase tracking-tight">{project.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>
      <TechStack items={project.stack} className="mt-4" dense />
    </article>
  );
}

export function PastProjects() {
  const listId = useId();
  const order = useSyncExternalStore(
    subscribePastProjectsOrder,
    getPastProjectsOrderSnapshot,
    getPastProjectsOrderServerSnapshot,
  );
  const projects = useMemo(() => orderProjects(order), [order]);
  const [dragSlug, setDragSlug] = useState<string | null>(null);
  const [overSlug, setOverSlug] = useState<string | null>(null);

  const moveSlug = useCallback(
    (fromSlug: string, toSlug: string) => {
      if (fromSlug === toSlug) return;
      const from = order.indexOf(fromSlug);
      const to = order.indexOf(toSlug);
      if (from < 0 || to < 0) return;
      const next = order.slice();
      const [moved] = next.splice(from, 1);
      if (!moved) return;
      next.splice(to, 0, moved);
      setPastProjectsOrder(next);
    },
    [order],
  );

  const onMoveWithKeyboard = useCallback(
    (slug: string, direction: -1 | 1) => {
      const index = order.indexOf(slug);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= order.length) return;
      const next = order.slice();
      const [moved] = next.splice(index, 1);
      if (!moved) return;
      next.splice(target, 0, moved);
      setPastProjectsOrder(next);
    },
    [order],
  );

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="scroll-mt-20 px-6 py-10 md:px-8 md:py-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id="projects-heading" index="02">
            Past projects
          </SectionHeading>
          <button
            type="button"
            onClick={resetPastProjectsOrder}
            className="min-h-9 border border-fg bg-bg px-3 font-display text-[10px] uppercase tracking-[0.16em] hover:bg-surface"
          >
            Reset order
          </button>
        </div>
        <Reveal className="mt-3 max-w-2xl">
          <p className="text-muted">
            Practice pieces from the earlier public gallery — drag a card to rearrange the trail.
            Selected works above remain the hiring argument.
          </p>
        </Reveal>
        <div id={listId} className="mt-6 grid gap-6 md:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              dragging={dragSlug === project.slug}
              dropTarget={overSlug === project.slug && dragSlug !== project.slug}
              onDragStart={setDragSlug}
              onDragOver={(event, slug) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverSlug(slug);
              }}
              onDragLeave={() => setOverSlug(null)}
              onDrop={(slug) => {
                if (dragSlug) moveSlug(dragSlug, slug);
                setDragSlug(null);
                setOverSlug(null);
              }}
              onDragEnd={() => {
                setDragSlug(null);
                setOverSlug(null);
              }}
              onMoveWithKeyboard={onMoveWithKeyboard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
