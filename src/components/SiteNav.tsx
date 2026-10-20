"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ContactIcon } from "@/components/Contact";
import { site } from "@/content/site";
import { withBasePath } from "@/lib/paths";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="h-1 bg-accent" aria-hidden="true" />
      <div className="h-1 bg-yellow" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 md:px-8">
        <a href="#main" className="flex items-center" aria-label={site.name}>
          <img
            src={withBasePath("/brand/dy-mark.jpg")}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0"
          />
        </a>
        <nav className="site-nav hidden items-center gap-7 md:flex" aria-label="Primary">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="link-line font-display text-sm uppercase tracking-[0.14em] text-muted transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className={`menu-toggle md:hidden ${open ? "is-open" : ""}`}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="menu-toggle-line" />
          <span className="menu-toggle-line" />
        </button>
      </div>
      <nav
        id="mobile-nav"
        className={`menu-screen md:hidden ${open ? "is-open" : ""}`}
        aria-label="Mobile"
        aria-hidden={!open}
      >
        <div className="menu-list flex flex-col gap-1">
          {site.nav.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              className="menu-fade link-line flex min-h-14 w-fit items-center font-display text-3xl uppercase tracking-[0.08em] text-header"
              style={{ "--fade-index": index } as CSSProperties}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
        <ul className="menu-icons flex flex-wrap gap-3">
          {site.contact.specs.map((row, index) => {
            const external = row.href.startsWith("http");
            return (
              <li key={row.key}>
                <a
                  href={row.href}
                  tabIndex={open ? 0 : -1}
                  aria-label={`${row.key}: ${row.value}`}
                  title={row.value}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="menu-fade flex min-h-11 min-w-11 items-center justify-center border border-header bg-bg px-3 text-header transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent hover:bg-accent hover:text-accent-fg"
                  style={{ "--fade-index": site.nav.length + index } as CSSProperties}
                  onClick={() => setOpen(false)}
                >
                  <ContactIcon name={row.key} />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
