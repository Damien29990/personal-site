import { Reveal } from "@/components/Reveal";

type SectionHeadingProps = {
  id: string;
  index: string;
  children: string;
};

export function SectionHeading({ id, index, children }: SectionHeadingProps) {
  return (
    <div className="sticky top-16 z-20 border-b border-line bg-bg py-4">
      <Reveal>
        <p className="font-display text-[11px] uppercase tracking-[0.18em] text-accent">{index}</p>
        <h2 id={id} className="mt-2 font-display text-3xl uppercase tracking-tight md:text-4xl">
          {children}
        </h2>
      </Reveal>
    </div>
  );
}
