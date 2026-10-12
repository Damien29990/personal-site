import { SectionHeading } from "@/components/SectionHeading";
import { SkillBoard } from "@/components/SkillBoard";

export function Methodology() {
  return (
    <section
      id="methodology"
      aria-labelledby="methodology-heading"
      className="scroll-mt-20 px-6 py-10 md:px-8 md:py-12"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="methodology-heading" index="05">
          Methodology
        </SectionHeading>
        <p className="mt-3 font-display text-[11px] uppercase tracking-[0.16em] text-yellow-fg">
          <span className="bg-yellow px-1.5 py-0.5">Anxiety bookshelf</span>
        </p>
        <div className="mt-6 border-t border-line pt-5">
          <SkillBoard />
        </div>
      </div>
    </section>
  );
}
