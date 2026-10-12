import { SiteBuild } from "@/components/SiteBuild";
import { site } from "@/content/site";

export function Hero() {
  return (
    <section className="border-b border-line px-6 pt-6 pb-8 md:px-8 md:pt-8 md:pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="hero-in">
            <p className="font-display text-[11px] uppercase tracking-[0.2em] text-accent">
              {site.identity}
            </p>
          </div>
          <div className="hero-in hero-name mt-4" style={{ animationDelay: "90ms" }}>
            <h1 className="font-display text-[clamp(3.25rem,13vw,9rem)] uppercase leading-[0.85] tracking-tight">
              {site.name}
            </h1>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-6 max-w-4xl md:-mt-4">
          <SiteBuild />
        </div>

        <div className="mx-auto mt-6 max-w-xl text-center md:mt-8">
          <div className="hero-in" style={{ animationDelay: "160ms" }}>
            <p className="text-base leading-relaxed text-muted md:text-lg">{site.proof}</p>
          </div>
          <div className="mt-5 flex justify-center">
            <a
              href="#work"
              className="inline-flex min-h-11 items-center bg-accent px-6 font-display text-sm uppercase tracking-[0.16em] text-accent-fg transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:opacity-90"
            >
              View selected works
            </a>
          </div>
          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {site.tags.map((tag) => (
              <li
                key={tag}
                className="tag-sweep bg-yellow px-2 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-yellow-fg [--tag-fill:var(--color-header)] [--tag-ink:var(--color-accent-fg)]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
