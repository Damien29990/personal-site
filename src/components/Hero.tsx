import { SiteBuild } from "@/components/SiteBuild";
import { site } from "@/content/site";
import { LOOP_SECONDS } from "@/scene/schedule";

export function Hero() {
  return (
    <section className="border-b border-line px-6 pt-12 pb-16 md:px-8 md:pt-16 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between border-b border-line pb-3 font-display text-[10px] uppercase tracking-[0.18em] text-muted">
          <p>
            {site.location} · {site.drawingId}
          </p>
          <p>{`Build cycle 0${LOOP_SECONDS / 60}:00`}</p>
        </div>

        <div className="mt-10 text-center md:mt-14">
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-accent">
            {site.identity}
          </p>
          <h1 className="mt-4 font-display text-[clamp(3.25rem,13vw,9rem)] uppercase leading-[0.85] tracking-tight">
            {site.name}
          </h1>
        </div>

        <div className="relative z-10 mx-auto mt-6 max-w-4xl md:-mt-4">
          <SiteBuild />
        </div>

        <div className="mx-auto mt-10 max-w-xl text-center md:mt-12">
          <p className="text-base leading-relaxed text-muted md:text-lg">{site.proof}</p>
          <div className="mt-8 flex justify-center">
            <a
              href="#work"
              className="inline-flex min-h-11 items-center bg-accent px-6 font-display text-sm uppercase tracking-[0.16em] text-accent-fg transition-opacity duration-200 hover:opacity-90"
            >
              View selected works
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {site.tags.map((tag) => (
              <li
                key={tag}
                className="border border-line px-2 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-muted"
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
