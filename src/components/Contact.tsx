import { site } from "@/content/site";
import { SectionHeading } from "@/components/SectionHeading";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-24 px-6 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="contact-heading" index="05">
          Contact / specifications
        </SectionHeading>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{site.contact.body}</p>
        <div className="mt-10 border border-line">
          <div className="grid grid-cols-[8rem_1fr] border-b border-line bg-surface font-display text-[11px] uppercase tracking-[0.16em] text-muted md:grid-cols-[12rem_1fr]">
            <p className="border-r border-line px-4 py-3">Field</p>
            <p className="px-4 py-3">Specification</p>
          </div>
          {site.contact.specs.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[8rem_1fr] border-b border-line last:border-b-0 md:grid-cols-[12rem_1fr]"
            >
              <p className="border-r border-line px-4 py-3 font-display text-[11px] uppercase tracking-[0.16em] text-accent">
                {row.key}
              </p>
              {row.href ? (
                <a
                  href={row.href}
                  className="link-line px-4 py-3 text-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  {row.value}
                </a>
              ) : (
                <p className="px-4 py-3 text-sm">{row.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
