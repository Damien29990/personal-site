"use client";

import { useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { TechStack } from "@/components/TechStack";
import { site } from "@/content/site";
import { withBasePath } from "@/lib/paths";

function indexLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function PastProjects() {
  const listId = useId();
  const projects = site.projects;
  const count = projects.length;
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; pointerId: number } | null>(null);

  function step(direction: -1 | 1) {
    setIndex((current) => Math.min(count - 1, Math.max(0, current + direction)));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    drag.current = { x: event.clientX, pointerId: event.pointerId };
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.current.x;
    drag.current = null;
    if (delta > 56) step(-1);
    else if (delta < -56) step(1);
  }

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="scroll-mt-20 px-6 py-10 md:px-8 md:py-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id="projects-heading" index="02">
            Projects
          </SectionHeading>
          <div className="flex items-center gap-3">
            <p
              aria-live="polite"
              className="font-display text-[11px] uppercase tracking-[0.18em] text-muted"
            >
              {indexLabel(index)} / {indexLabel(count - 1)}
            </p>
            <button
              type="button"
              className="project-move"
              aria-label="Show previous project"
              aria-controls={listId}
              disabled={index === 0}
              onClick={() => step(-1)}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              className="project-move"
              aria-label="Show next project"
              aria-controls={listId}
              disabled={index === count - 1}
              onClick={() => step(1)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <Reveal className="mt-3 max-w-2xl">
          <p className="text-muted">
            Move through the trail — a playable sci-fi airlock, then earlier studies from the public
            gallery. Selected works above remain the hiring argument.
          </p>
        </Reveal>
        <div
          id={listId}
          className="project-rail mt-6"
          aria-roledescription="carousel"
          aria-label="Projects"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              step(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              step(1);
            }
          }}
        >
          <div
            className="project-rail-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            {projects.map((project, projectIndex) => {
              const href = "href" in project ? project.href : undefined;
              const interactive = projectIndex === index;
              return (
              <article
                key={project.slug}
                className="project-slide"
                aria-hidden={!interactive}
                aria-roledescription="slide"
                aria-label={`${indexLabel(projectIndex)} ${project.name}`}
              >
                <div className="grid items-start gap-6 md:grid-cols-12 md:items-center">
                  <div className="overflow-hidden border border-fg bg-surface md:col-span-7">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        tabIndex={interactive ? 0 : -1}
                        aria-label={`Play ${project.name}`}
                        className="block cursor-pointer"
                      >
                        <img
                          src={withBasePath(project.image)}
                          alt=""
                          className="aspect-[16/10] w-full object-cover"
                          draggable={false}
                        />
                      </a>
                    ) : (
                      <img
                        src={withBasePath(project.image)}
                        alt=""
                        className="aspect-[16/10] w-full object-cover"
                        draggable={false}
                      />
                    )}
                  </div>
                  <div className="md:col-span-5">
                    <p className="font-display text-[11px] uppercase tracking-[0.18em] text-accent">
                      {indexLabel(projectIndex)} · {project.type}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <h3 className="font-display text-3xl uppercase tracking-tight">
                        {project.name}
                      </h3>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={interactive ? 0 : -1}
                          aria-label={`Play ${project.name}`}
                          className="project-move project-play shrink-0"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
                            <path d="M8 5.5v13l11-6.5L8 5.5Z" />
                          </svg>
                          Play
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>
                    <TechStack items={project.stack} className="mt-4" dense />
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
