"use client";

import { useState } from "react";
import { site } from "@/content/site";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="h-1 bg-accent" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-8">
        <a href="#main" className="flex items-baseline gap-3">
          <span className="font-display text-sm uppercase tracking-[0.16em] text-fg">
            {site.drawingId}
          </span>
          <span className="hidden font-display text-sm uppercase tracking-[0.16em] text-muted sm:inline">
            {site.name}
          </span>
        </a>
        <p className="hidden items-center gap-2 font-display text-[11px] uppercase tracking-[0.18em] text-accent md:flex">
          <span className="inline-block h-2 w-2 bg-accent" aria-hidden="true" />
          {site.status}
        </p>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-display text-sm uppercase tracking-[0.14em] text-muted transition-opacity duration-200 hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="inline-flex min-h-11 items-center border border-fg px-3 font-display text-sm uppercase tracking-[0.14em] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-line px-6 py-4 md:hidden"
          aria-label="Mobile"
        >
          <p className="mb-3 flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.18em] text-accent">
            <span className="inline-block h-2 w-2 bg-accent" aria-hidden="true" />
            {site.status}
          </p>
          <div className="flex flex-col">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center font-display text-sm uppercase tracking-[0.14em]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
