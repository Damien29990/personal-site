---
name: personal-website
description: Design and build employer-captivating personal websites in React and Tailwind CSS, with editorial human-centered UI/UX that emphasizes the owner's experience and personality. Use when creating a personal site, portfolio, resume site, about page, or personal brand homepage; when choosing what to show recruiters and hiring managers; or when the user asks for a beautiful, high-craft personal website.
---

# Personal Website — Employer-Captivating Craft

Build a personal site as a **hiring artifact**, not a generic portfolio template. The page itself is the first work sample: taste, clarity, and restraint must signal seniority before a line of copy is read.

**Implementation stack is React + Tailwind CSS only.** Keep adjacent web-app knowledge (routing, SEO, a11y, performance, hosting) as judgment — do not expand the UI stack.

## When to use

Apply when the user mentions: personal website, portfolio, resume site, about page, personal brand, homepage, landing page for themselves, or "site that impresses employers / recruiters / hiring managers."

## Non-negotiables

1. **React + Tailwind only for UI.** No MUI, Chakra, Ant, Bootstrap, styled-components, or shadcn unless the user explicitly asks. No extra CSS frameworks.
2. **TypeScript + Vite** is the default toolchain (matches this repo). Do not switch to Next.js unless the user needs SSR/SEO beyond static meta tags.
3. **The site must look designed**, not generated. Distinct type pairing, a tight palette, real hierarchy, and generous whitespace. If it could be a theme forest template, start over.
4. **Employers first.** Above the fold must answer: who is this, what are they unusually good at, why should I keep scrolling, how do I contact them.
5. **Experience and personality over inventory.** Three deep proof pieces beat twelve project cards. Voice is specific, never "passionate developer."
6. **The craft is the proof.** Spacing, type, motion, and copy quality are part of the candidate's signal. Ship something a design-literate hiring manager would respect.

## Discovery (do this before pixels)

Ask only what changes design or content. Infer the rest from CVs, GitHub, LinkedIn, or the repo if present.

- Name as it should appear, and a **precise identity** (not "Full Stack Developer")
- Target role + city/region (e.g. Hong Kong / remote) and language (`en`, `zh-HK`, or both)
- 2–4 proof pieces with outcomes (problem, role, result, artifact)
- Personality keywords they endorse (restraint, systems, craft, humor — pick few)
- Contact: email, LinkedIn, GitHub, optional calendar
- Photo: only if they want one and have a real asset — never a stock headshot
- Constraints: must-have sections, things they refuse to show

If they cannot name proof pieces, mine the workspace and propose a shortlist. Do not invent employers, metrics, or testimonials.

## Default information architecture

Single-page, long-scroll. Multi-route only when case studies need their own URL.

| Order | Section | Employer job |
|-------|---------|----------------|
| 1 | Sticky nav | Name, Work, About, Contact — always a contact path |
| 2 | Hero | Identity, one proof line, primary CTA, secondary "see work" |
| 3 | Selected work | 2–4 case studies with outcome, not a screenshot grid |
| 4 | Experience | Impact bullets, not job-description paste |
| 5 | About | Human: how they think, what they optimize for, a few specifics |
| 6 | Skills | Short, attached to work — not a chip cloud or % bars |
| 7 | Contact | One obvious action, plus 2–3 real links |

Skip Blog, Testimonials, Services, Newsletter, and Clients logos unless the user has real material.

Full copy formulas and recruiter scan path: [content.md](content.md).

## Visual direction (beauty with restraint)

Treat the layout as editorial, not a dashboard and not a Dribbble shot dump.

- **One accent**, two neutrals, one surface. Derive accent from the owner's domain or a real brand color they already use — not purple-on-black by default.
- **Type pairing with character.** A distinctive display face + a readable body. Do not default to Inter + Inter. Load 2 families max (variable fonts preferred).
- **Hierarchy is the design.** Huge name or headline, small meta, clear CTA. If everything is medium, nothing is designed.
- **Whitespace is luxury.** Prefer `max-w-5xl`/`max-w-6xl` content, not full-bleed walls of cards. Asymmetry > equal 3-column grids.
- **Motion is etiquette.** CSS `transition` on `transform`/`opacity` only. Honor `prefers-reduced-motion`. No particle backgrounds, custom cursors, or scroll-jacking. A Hero **voxel diorama** is allowed as a ConTech work artifact (see `threejs-voxel-animation`); it is not page chrome.
- **Mobile is a first-class recruiter device.** Thumb-reachable CTA, no hover-only information.

Full tokens, type scale, and anti-clichés: [design.md](design.md).

## Stack knowledge (judgment, not extra libraries)

Know the wider web-app stack; **do not install it** unless the user asks or a requirement is otherwise impossible.

| Concern | Default here | Reach for only if needed |
|---------|--------------|--------------------------|
| UI | React 19 + Tailwind v4 | Component kit if user demands |
| Tooling | Vite + TypeScript strict | Next.js for SSR/file routes |
| Routing | One page + `#work` hashes | React Router for `/work/:slug` |
| Content | Typed TS module (`src/content/site.ts`) | CMS/MDX if they will self-edit often |
| SEO | `index.html` title/description + OG tags | `react-helmet-async` if titles must change per route |
| A11y | Semantic HTML, skip link, focus rings, contrast | Extra a11y libs rarely |
| Data | Static props | Fetch only for live proof (GitHub, etc.) |
| Hosting | Static `vite build` | SSR host only with Next |

Keep Redux, TanStack Query, auth, and analytics off the first version. A personal site is a brochure with craft, not an app.

Copy-in section patterns: [examples.md](examples.md).

## Implementation rules

- Content lives in `src/content/site.ts` as typed objects. Components do not hardcode the owner's bio.
- Components are small and section-named: `Hero`, `SiteDiorama`, `SelectedWork`, `CaseStudy`, `Experience`, `About`, `Contact`, `SiteNav`, `SiteFooter`.
- Tailwind in class names. No inline `style={{}}` for layout/color except true dynamic values (e.g. a user-supplied accent).
- Images in `public/` with explicit `width`/`height` or aspect boxes; lazy-load below the fold.
- Semantic landmarks: `header`, `main`, `nav`, `section` with `aria-labelledby`, `footer`.
- Keyboard: visible `:focus-visible` rings, skip-to-content, working in-page anchors.
- Contrast: body text meets WCAG AA on the actual background.
- Verify in the browser at desktop (~1280) and mobile (~390): hero, work, contact, and focus states. Confirm reduced-motion does not hide content.

## Build order

1. Extract `src/content/site.ts` from discovery (identity, case studies, experience, contact).
2. Set CSS variables / Tailwind theme: color, type, radius — then page shell (`nav` + `main` + `footer`).
3. Hero until the 10-second test passes (identity + proof + CTA readable on mobile).
4. One complete case study at full quality; clone the pattern for the rest.
5. Experience + About (personality, not filler).
6. Contact + metadata (title, description, OG, favicon).
7. Polish: spacing rhythm, hover/focus, reduced-motion, empty-image fallbacks.
8. Browser pass: recruiter scan (no scroll) → work depth → contact click.

## What NOT to do

- ❌ Purple gradient hero, floating blobs, Inter everywhere, "Hi, I'm a developer."
- ❌ Skill bars (`React 90%`) or an endless logo soup.
- ❌ Twelve equal project cards with "HTML, CSS, JS" tags.
- ❌ Lorem ipsum, fake metrics, stock portraits, invented testimonials.
- ❌ Particle canvases, custom cursors, auto-playing sound, scroll-jacking.
- ❌ Hamburger on desktop; hover-only nav on mobile.
- ❌ Cookie walls, newsletter modals, calendly popups before content.
- ❌ Adding shadcn, Framer Motion, or a CMS "for completeness." Do not add Three.js as page chrome (particles, full-bleed WebGL, Spline blobs). A Hero voxel diorama as a ConTech *work artifact* is allowed — follow `.cursor/skills/threejs-voxel-animation`.
- ❌ Treating the site as a second CV dump. The CV is a file; the site is a point of view.

## Quality bar (ship only if all pass)

- [ ] A stranger knows the target role and a proof point in 10 seconds
- [ ] Personality is visible in type, layout, and copy — not a "Fun facts" widget
- [ ] Work entries have problem → role → outcome, not just a screenshot
- [ ] Contact is obvious on mobile without opening a menu
- [ ] The site would look embarrassing if the type were swapped for Arial and the spacing collapsed — meaning hierarchy was doing the work
- [ ] No template clichés from [design.md](design.md)
- [ ] `prefers-reduced-motion` still yields a complete page
- [ ] Browser-verified at 1280 and 390

## References

- [content.md](content.md) — recruiter psychology, section copy, what to show/hide
- [design.md](design.md) — palette, type, spacing, motion, anti-clichés
- [examples.md](examples.md) — React + Tailwind section patterns
