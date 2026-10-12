import { site } from "@/content/site";
import { SectionHeading } from "@/components/SectionHeading";

type ContactKey = (typeof site.contact.specs)[number]["key"];

function ContactIcon({ name }: { name: ContactKey }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    className: "h-6 w-6",
    fill: "currentColor",
  };

  if (name === "EMAIL") {
    return (
      <svg {...common}>
        <path d="M3 5.5h18v13H3v-13Zm1.6 1.4 7.4 5.2 7.4-5.2H4.6Zm14.8 10.6V8.2l-7.4 5.2L4.6 8.2v9.3h14.8Z" />
      </svg>
    );
  }

  if (name === "PHONE") {
    return (
      <svg {...common}>
        <path d="M7.2 3.2h2.1l1.2 3.1-1.5 1.1a12.4 12.4 0 0 0 5.6 5.6l1.1-1.5 3.1 1.2v2.1c0 .7-.5 1.3-1.2 1.4A15.2 15.2 0 0 1 5.8 4.4c.1-.7.7-1.2 1.4-1.2Z" />
      </svg>
    );
  }

  if (name === "LINKEDIN") {
    return (
      <svg {...common}>
        <path d="M5.7 8.7H3.2V20h2.5V8.7ZM4.4 3.5A1.6 1.6 0 1 0 4.5 6.7 1.6 1.6 0 0 0 4.4 3.5ZM20.8 20h-2.5v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H12V8.7h2.4v1.5h.1c.3-.6 1.2-1.8 2.9-1.8 3.1 0 3.7 2 3.7 4.7V20Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 2.2A9.8 9.8 0 0 0 8.7 21.3c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.6s.8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1a3.6 3.6 0 0 1 .1 2.6 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z" />
    </svg>
  );
}

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-20 px-6 py-10 md:px-8 md:py-12"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="contact-heading" index="06">
          Contact / specifications
        </SectionHeading>
        <p className="mt-3 max-w-xl font-display text-xl uppercase tracking-tight text-header md:text-2xl">
          {site.contact.heading}
        </p>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{site.contact.body}</p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {site.contact.specs.map((row) => {
            const external = row.href.startsWith("http");
            return (
              <li key={row.key}>
                <a
                  href={row.href}
                  aria-label={`${row.key}: ${row.value}`}
                  title={row.value}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex min-h-11 min-w-28 flex-col items-center justify-center gap-2 border border-header bg-bg px-4 py-3 text-header transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent hover:bg-accent hover:text-accent-fg focus-visible:border-accent focus-visible:bg-accent focus-visible:text-accent-fg"
                >
                  <ContactIcon name={row.key} />
                  <span className="font-display text-[10px] uppercase tracking-[0.16em] whitespace-nowrap">
                    {row.key === "PHONE" ? row.value : row.key}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
