# Examples — React + Tailwind Patterns

Patterns to copy and adapt. Keep content in a typed module; keep classes in the component. Names and copy below are illustrative — replace from discovery.

## Content module

```ts
// src/content/site.ts
export const site = {
  name: "Alex Chen",
  identity: "ConTech engineer in Hong Kong",
  proof:
    "I turn messy site operations into live systems operators actually use.",
  location: "Hong Kong · open to remote",
  email: "alex@example.com",
  links: {
    github: "https://github.com/example",
    linkedin: "https://linkedin.com/in/example",
    cv: "/alex-chen-cv.pdf",
  },
  work: [
    {
      slug: "smart-site-overlay",
      title: "Live overlay for a 4S construction site",
      eyebrow: "Selected work",
      context:
        "Night-shift supervisors were tracking crane status in a spreadsheet that aged by morning.",
      role: "Sole interface + scene integration",
      decisions: [
        "Kept the UI as a thin overlay, not a second dashboard they would ignore",
        "Favored readable type over decorative 3D chrome",
      ],
      result: "The overlay stayed open on the cabin display through a full shift trial.",
      stack: ["React", "Tailwind CSS", "Three.js"],
      href: "#",
      image: { src: "/work/smart-site.jpg", alt: "Site overlay on a tower-crane scene" },
    },
  ],
  experience: [
    {
      company: "Example Builders",
      title: "Systems engineer",
      dates: "2024 — present",
      bullets: [
        "Replaced a weekly Excel crane log with a live overlay the night shift kept open.",
      ],
    },
  ],
  about: {
    paragraphs: [
      "I care about whether a tool survives contact with a real site: dust, shift changes, and impatient operators.",
    ],
    specifics: [
      "Optimize for: clarity under stress",
      "Usually found: walking the site before touching Figma",
    ],
  },
} as const;
```

## Page shell

```tsx
// src/App.tsx
import { SiteNav } from "./components/SiteNav";
import { Hero } from "./components/Hero";
import { SelectedWork } from "./components/SelectedWork";
import { Experience } from "./components/Experience";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { SiteFooter } from "./components/SiteFooter";

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--bg)] focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <SelectedWork />
        <Experience />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
```

## Hero

```tsx
export function Hero() {
  return (
    <section className="px-6 pt-28 pb-24 md:px-8 md:pt-36 md:pb-32">
      <div className="mx-auto grid max-w-6xl items-end gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fg-muted)]">
            {site.location}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-[var(--fg)] md:text-7xl">
            {site.name}
          </h1>
          <p className="mt-4 text-xl text-[var(--fg)] md:text-2xl">{site.identity}</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
            {site.proof}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-fg)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Email me
            </a>
            <a
              href="#work"
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-5 text-sm font-semibold text-[var(--fg)] transition-opacity duration-200 hover:opacity-70"
            >
              See selected work
            </a>
          </div>
        </div>
        <div className="md:col-span-5">{/* portrait or a still — or leave empty */}</div>
      </div>
    </section>
  );
}
```

## Case study (deep, not a card)

```tsx
<article className="grid items-start gap-10 md:grid-cols-12">
  <div className="md:col-span-7">
    <img
      src={work.image.src}
      alt={work.image.alt}
      width={1600}
      height={1000}
      className="aspect-[16/10] w-full rounded-lg object-cover"
    />
  </div>
  <div className="md:col-span-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
      {work.eyebrow}
    </p>
    <h3 className="mt-3 font-display text-3xl tracking-tight">{work.title}</h3>
    <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">{work.context}</p>
    <p className="mt-3 text-sm">
      <span className="text-[var(--fg-muted)]">Role.</span> {work.role}
    </p>
    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
      {work.decisions.map((d) => (
        <li key={d}>{d}</li>
      ))}
    </ul>
    <p className="mt-4 text-sm leading-relaxed">{work.result}</p>
    <p className="mt-6 text-xs tracking-wide text-[var(--fg-muted)]">
      {work.stack.join(" · ")}
    </p>
  </div>
</article>
```

## Experience row

```tsx
<li className="grid gap-2 border-t border-[var(--line)] py-8 md:grid-cols-12">
  <p className="text-sm text-[var(--fg-muted)] md:col-span-3">{role.dates}</p>
  <div className="md:col-span-9">
    <p className="font-medium">
      {role.title} · {role.company}
    </p>
    <ul className="mt-3 space-y-2 text-[var(--fg-muted)]">
      {role.bullets.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  </div>
</li>
```

## Global CSS sketch (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  --font-display: "Fraunces", ui-serif, serif;
  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --color-bg: oklch(0.98 0.01 85);
  --color-fg: oklch(0.22 0.02 60);
  --color-muted: oklch(0.45 0.02 60);
  --color-accent: oklch(0.55 0.12 55);
  --color-accent-fg: oklch(0.99 0.01 85);
  --color-line: oklch(0.90 0.01 85);
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

:root {
  --bg: var(--color-bg);
  --fg: var(--color-fg);
  --fg-muted: var(--color-muted);
  --accent: var(--color-accent);
  --accent-fg: var(--color-accent-fg);
  --line: var(--color-line);
}

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
}

.font-display {
  font-family: var(--font-display);
}
```

Map `--bg` / `--fg` in components to these theme colors, or alias them on `:root` for the examples above.

## What "done" looks like in code

- `src/content/site.ts` is the only file a non-designer should edit to change copy
- Sections are server-free function components, no global CSS soup besides tokens
- No `any`, no inline layout colors, no unused animation wrappers
