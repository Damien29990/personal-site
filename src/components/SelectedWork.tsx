import { CaseStudy } from "@/components/CaseStudy";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/content/site";

export function SelectedWork() {
  const [featured, ...rest] = site.work;

  return (
    <section id="work" aria-labelledby="work-heading" className="scroll-mt-24 px-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="work-heading" index="01">
          Selected works
        </SectionHeading>
        <p className="mt-3 max-w-2xl text-muted">
          Two surfaces of the same problem: keep a construction site honest while people are still on it.
        </p>
        {featured ? <CaseStudy work={featured} featured /> : null}
        {rest.map((work) => (
          <CaseStudy key={work.slug} work={work} />
        ))}
      </div>
    </section>
  );
}
