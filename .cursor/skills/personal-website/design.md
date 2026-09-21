# Design — Beauty, Human Factors, Anti-Clichés

The site should feel **composed**, like a well-set essay, not like a UI kit demo. Hiring managers notice type, margin, and whether the page respects their time.

## Principles

1. **Hierarchy first.** One dominant element per viewport (name, or a case-study title). Everything else is supporting.
2. **Fewer, better.** One accent, two typefaces, one radius language, one shadow language (often: no shadow, just border + space).
3. **Human scale.** Line length ~60–72 characters for body. Buttons look pressable. Hit targets ≥ 44px on mobile.
4. **Quiet motion.** The page never competes with the work. If motion is removed, the design still holds.
5. **Craft in the defaults.** Selection color, focus ring, visited links, empty images — designed, not browser-default.

## Palette

Build from the owner's world (site amber, ink, paper, a uniform color) rather than a generic "tech purple."

Suggested token shape (map to Tailwind `@theme` / CSS variables):

```css
--bg:        /* page: warm paper or deep ink, not #fff vs #000 by default */
--fg:        /* body text, WCAG AA on --bg */
--fg-muted:  /* meta, dates — still readable */
--accent:    /* one; used for links, CTA, a thin rule — not entire sections */
--accent-fg: /* text on accent (check contrast) */
--line:      /* hairline borders, low contrast */
--surface:   /* cards / nav frost if needed */
```

Rules:

- Accent appears in **< 10%** of the viewport (links, one button, one rule, maybe a eyebrow badge).
- Do not color-code every tag. Tags are `muted` + a border.
- Dark or light is a commitment. If dark, warm the blacks (`stone`/`zinc`/`neutral`), never pure `#000` with electric blue text.
- Test body copy on the real background. Grey-on-grey fails more portfolios than "ugly fonts."

## Typography

Load **at most two** families (or one family with a display cut). Prefer variable fonts.

Direction (pick one and commit):

| Mood | Display | Body |
|------|---------|------|
| Editorial / senior | Newsreader, Fraunces, or Instrument Serif | Source Serif 4 or IBM Plex Sans |
| Product / precise | Instrument Sans or Geist | Geist or IBM Plex Sans |
| Technical / field | IBM Plex Mono for *eyebrows only* | Plex Sans + a serif for titles |

Do not use Inter, Roboto, Open Sans, or Arial as the display face. They read as "unset."

Scale (mobile → desktop; Tailwind-ish):

| Role | Size | Weight | Tracking |
|------|------|--------|----------|
| Eyebrow | 11–12px | 600 | `0.08em` uppercase |
| Hero name / title | 40–72px | 500–600 | slight negative |
| Section title | 28–40px | 500 | normal |
| Body | 16–18px | 400 | normal, `leading-relaxed` |
| Meta | 13–14px | 400 | `0.01em` |
| CTA | 14–16px | 600 | normal |

One headline may break onto 2–3 lines. Do not shrink hero type to fit a slogan on one line.

## Layout & spacing

- Base unit **8px**. Stack sections with `py-24`/`py-32` on desktop, `py-16` on mobile — not `py-8` everywhere.
- Content column `max-w-5xl` or `max-w-6xl` + horizontal `px-6`/`px-8`. Full-bleed only for a single image or a hairline.
- **Asymmetry:** hero text left, a portrait or a still right (or empty space). Equal three-up cards are a last resort, never the hero.
- Nav is a thin bar: name left, links right, CTA outlined or solid — not a giant glassmorphism island.
- Case studies: image and text in a 5/7 or 6/6 split that **alternates** once, then stop alternating every row (that pattern dates fast). Prefer a vertical rhythm: still → title → story.

Grid anti-pattern: 12 similar cards with equal screenshots. If you only have stills, vary size: first work large, others compact.

## Components (human, not chrome)

**Buttons.** One primary (accent fill), one secondary (border). Radius consistent (`rounded-full` for CTA *or* `rounded-md` for all — not mixed). Hover: slight `translate-y` or opacity, not grow-and-glow.

**Links.** Underline on hover for inline text. Do not remove focus rings. `focus-visible:outline` with offset on `--bg`.

**Cards.** Prefer no card. If you need a surface, `border` + padding, almost no shadow. Shadow if any: `shadow-sm` and warm, not a black 40px blur.

**Tags.** Small, low contrast, no rainbow.

**Nav.** `sticky top-0` with a hairline and a slightly translucent `--bg` (`backdrop-blur` is allowed). Collapse to a simple top sheet on mobile — not a clever circular FAB.

**Footer.** Name, email, one line of locale/time honesty if relevant. Small. No six-column sitemap.

## Motion

- Animate `transform` and `opacity` only
- Duration 150–250ms UI; 400–600ms only for large stills entering once
- `prefers-reduced-motion: reduce`: no entrance choreography; show final state
- Do not animate the hero on a loop
- Scroll: native. No hijacking, no smooth-scroll libraries. `scroll-behavior: smooth` on `html` is enough for in-page links

## Imagery

- Real stills of the owner's work. Browser chrome is fine; fake 3D device mocks are not required
- Consistent crop ratio per section (e.g. 16/10 for case studies)
- `alt` describes the work ("Tower-crane overlay on a 4S site model"), not "screenshot 1"
- If no image exists, a typographic case-study block is more honest than a gradient placeholder

## Color & a11y

- Body and `--fg-muted` both AA on `--bg`
- Accent used as text must AA; if not, use accent only as a 2–3px rule or button fill with `--accent-fg`
- Never convey state by color alone (current nav item: weight + rule)
- `:focus-visible` visible on keyboard only
- Skip link as the first focusable node

## Anti-clichés (do not ship)

These read as "AI portfolio / 2021 template" to design-literate employers:

- Purple/blue mesh gradient hero + white Inter text
- Floating 3D blobs, spline loops, particle.js, or a full-page WebGL wallpaper (a contained Hero voxel diorama is the exception; see `threejs-voxel-animation`)
- Bento grid of random metrics ("12+ projects", "99% caffeine")
- Custom circle cursor / cursor trail
- Typed.js looping "Developer | Creator | Dreamer"
- Full-screen video backgrounds
- Glassmorphism on every card
- Skill wheels and percent bars
- Neon on black with 8px glow
- Unsplash "laptop on desk"
- Overlapping rotated polaroids
- Section titles with a fake number "01 / 02 / 03" plus a huge vertical "ABOUT" watermark
- Emoji as a design system (one is fine in copy, not as nav icons)

If the first screenshot looks like a template, change type, palette, *and* layout — not just the accent hex.

## Mood check before coding CSS

Write three words the site should feel like (example: `calm, exact, warm`). Every class you add must serve those words. If a decoration does not serve them, delete it.
