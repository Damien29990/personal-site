import { Reveal } from "@/components/Reveal";

type SectionHeadingProps = {
  id: string;
  index: string;
  children: string;
};

export function SectionHeading({ id, index, children }: SectionHeadingProps) {
  return (
    <div className="sticky top-[4.25rem] z-20 border-b border-line bg-bg py-2">
      <Reveal>
        <p className="font-display text-[11px] uppercase tracking-[0.18em] text-yellow-fg">
          <span className="bg-yellow px-1.5 py-0.5">{index}</span>
        </p>
        <h2 id={id} className="mt-1 font-display text-3xl uppercase tracking-tight md:text-4xl">
          {children}
        </h2>
      </Reveal>
    </div>
  );
}
