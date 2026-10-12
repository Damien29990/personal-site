"use client";

import { TagChipIcon, tagChipClassName } from "@/components/TagChip";

type TechStackProps = {
  items: readonly string[];
  className?: string;
  /** Slightly denser chips for case-study side columns. */
  dense?: boolean;
};

export function TechStack({ items, className = "", dense = false }: TechStackProps) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Technology stack">
      {items.map((name) => (
        <li key={name} className={tagChipClassName(dense)}>
          <TagChipIcon name={name} dense={dense} />
          <span>{name}</span>
        </li>
      ))}
    </ul>
  );
}
