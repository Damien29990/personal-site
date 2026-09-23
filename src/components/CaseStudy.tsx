import type { WorkItem } from "@/content/site";

type CaseStudyProps = {
  work: WorkItem;
  featured?: boolean;
};

export function CaseStudy({ work, featured = false }: CaseStudyProps) {
  return (
    <article className="group relative grid items-start gap-10 border-t border-line py-16 md:grid-cols-12 md:py-20">
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
      />
      <div className={featured ? "md:col-span-7" : "md:col-span-5 md:col-start-1"}>
        <div
          className={`flex aspect-[16/10] flex-col justify-between border bg-surface p-6 transition-[border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-8 ${featured ? "border-accent" : "border-fg group-hover:border-accent"}`}
        >
          <p className="font-display text-[11px] uppercase tracking-[0.16em] text-accent">
            {work.eyebrow}
          </p>
          <p className="font-display text-2xl uppercase leading-snug tracking-tight md:text-3xl">
            {work.result}
          </p>
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-muted">
            {work.stack.join(" · ")}
          </p>
        </div>
      </div>
      <div className={featured ? "md:col-span-5" : "md:col-span-6 md:col-start-7"}>
        <h3 className="font-display text-3xl uppercase tracking-tight">{work.title}</h3>
        <p className="mt-4 leading-relaxed text-muted">{work.context}</p>
        <p className="mt-4 text-sm leading-relaxed">
          <span className="text-muted">Role. </span>
          {work.role}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          {work.decisions.map((decision) => (
            <li key={decision}>{decision}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed">{work.result}</p>
        <p className="mt-6 font-display text-[10px] uppercase tracking-[0.14em] text-muted">
          {work.stack.join(" · ")}
        </p>
      </div>
    </article>
  );
}
