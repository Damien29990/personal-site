import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { site, type ProjectItem } from "@/content/site";
import { withBasePath } from "@/lib/paths";

function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <article className="group relative border-t border-line pt-8">
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
      />
      <div className="overflow-hidden border border-fg bg-surface">
        <img
          src={withBasePath(project.image)}
          alt=""
          className="aspect-[16/10] w-full object-cover"
        />
      </div>
      <p className="mt-5 font-display text-[11px] uppercase tracking-[0.18em] text-accent">
        {project.index} · {project.type}
      </p>
      <h3 className="mt-2 font-display text-2xl uppercase tracking-tight">{project.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>
      <p className="mt-4 font-display text-[10px] uppercase tracking-[0.14em] text-muted">
        {project.stack.join(" · ")}
      </p>
    </article>
  );
}

export function PastProjects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="scroll-mt-24 px-6 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="projects-heading" index="02">
          Past projects
        </SectionHeading>
        <Reveal className="mt-3 max-w-2xl">
          <p className="text-muted">
            The public gallery from the earlier site — practice work kept as a trail, not as selected case studies.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {site.projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
