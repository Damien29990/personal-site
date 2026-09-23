import { CaseStudy } from "@/components/CaseStudy";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/content/site";

export function SelectedWork() {
  const [featured, ...rest] = site.work;

  return (
    <section id="work" aria-labelledby="work-heading" className="scroll-mt-24 px-6 pt-20 md:px-8 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="work-heading" index="01">
          Selected works
        </SectionHeading>
        <Reveal className="mt-3 max-w-2xl">
          <p className="text-muted">
            Two surfaces of the same problem: keep a construction site honest while people are still on it.
          </p>
        </Reveal>
        {featured ? <CaseStudy work={featured} featured /> : null}
        {rest.map((work) => (
          <CaseStudy key={work.slug} work={work} />
        ))}
      </div>
    </section>
  );
}
