import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/content/site";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-24 px-6 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionHeading id="about-heading" index="04">
            About & methodology
          </SectionHeading>
        </div>
        <div className="md:col-span-7">
          {site.about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-0 mb-5 text-lg leading-relaxed text-muted first:mt-0">
              {paragraph}
            </p>
          ))}
          <ul className="mt-8 space-y-3 border-t border-line pt-8 text-sm leading-relaxed">
            {site.about.specifics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {site.skills.map((group) => (
              <div key={group.group}>
                <p className="font-display text-[11px] uppercase tracking-[0.16em] text-accent">
                  {group.group}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
