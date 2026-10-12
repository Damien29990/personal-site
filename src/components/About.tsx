import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/content/site";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-20 px-6 py-10 md:px-8 md:py-12"
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionHeading id="about-heading" index="04">
            About
          </SectionHeading>
        </div>
        <div className="md:col-span-7">
          {site.about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-0 mb-5 text-lg leading-relaxed text-muted first:mt-0">
              {paragraph}
            </p>
          ))}
          <ul className="mt-5 space-y-3 border-t border-line pt-5 text-sm leading-relaxed">
            {site.about.specifics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
