"use client";

import { techIconSrc } from "@/lib/techIcons";

export function tagChipClassName(dense: boolean, extra = ""): string {
  return `tag-sweep inline-flex items-center gap-1.5 border border-line bg-surface font-display uppercase tracking-[0.12em] text-muted [--tag-fill:var(--color-yellow)] [--tag-ink:var(--color-yellow-fg)] ${
    dense ? "px-1.5 py-1 text-[9px]" : "px-2 py-1.5 text-[10px]"
  } ${extra}`.trim();
}

export function TagChipIcon({
  name,
  dense = false,
  size,
}: {
  name: string;
  dense?: boolean;
  size?: number;
}) {
  const src = techIconSrc(name);
  if (!src) return null;
  const px = size ?? (dense ? 12 : 14);
  return (
    <img
      src={src}
      alt=""
      width={px}
      height={px}
      className="shrink-0"
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}
