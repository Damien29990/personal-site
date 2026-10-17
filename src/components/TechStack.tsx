"use client";

import { TagChipIcon, tagChipClassName } from "@/components/TagChip";

type TechStackProps = {
  items: readonly string[];
  className?: string;
  /** Slightly denser chips for case-study side columns. */
  dense?: boolean;
  /** Icon and name only, with no chip fill or border. */
  plain?: boolean;
};

export function TechStack({ items, className = "", dense = false, plain = false }: TechStackProps) {
  return (
    <ul
      className={`flex flex-wrap ${plain ? "gap-x-4 gap-y-2" : "gap-2"} ${className}`}
      aria-label="Technology stack"
    >
      {items.map((name) => (
        <li
          key={name}
          className={
            plain
              ? "inline-flex items-center gap-1.5 bg-transparent font-display text-[10px] uppercase tracking-[0.12em]"
              : tagChipClassName(dense)
          }
        >
          <TagChipIcon name={name} dense={dense} />
          <span>{name}</span>
        </li>
      ))}
    </ul>
  );
}
