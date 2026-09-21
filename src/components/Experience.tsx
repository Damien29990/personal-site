import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/content/site";

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="scroll-mt-24 px-6 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="experience-heading" index="02">
          Experience & deployments
        </SectionHeading>
        <ul className="mt-10">
          {site.experience.map((role) => (
            <li
              key={`${role.company}-${role.title}`}
              className="grid gap-2 border-t border-line py-8 md:grid-cols-12"
            >
              <p className="font-display text-sm uppercase tracking-[0.12em] text-muted md:col-span-3">
                {role.dates}
              </p>
              <div className="md:col-span-9">
                <p className="font-display text-xl uppercase tracking-tight">
                  {role.title} · {role.company}
                </p>
                <ul className="mt-3 space-y-2 text-muted">
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <p className="border-t border-line py-8 text-sm leading-relaxed text-muted">
          {site.education}
        </p>
      </div>
    </section>
  );
}
