# Content — Experience, Personality, Employer Capture

A hiring manager gives the hero ~10 seconds and the whole page ~2 minutes. Write for that budget. The site must make them feel they already know how this person thinks.

## Two audiences, one page

| Audience | Time | They need | You give |
|----------|------|-----------|----------|
| Recruiter | 10–30s | Role fit, seniority, location, contact | Precise headline, proof line, location, one CTA |
| Hiring manager | 1–3 min | Taste, depth, how they ship | 2–4 case studies, impact bullets, a human About |

Never write a third audience ("everyone"). Personality is a filter; the right employers lean in.

## The 10-second hero test

A stranger must be able to say, without scrolling:

1. **Name**
2. **What they are, specifically** (domain + altitude, not a title farm)
3. **Why they are not interchangeable** (one proof: outcome, system, or craft)
4. **What to do next** (email, or jump to work)

**Weak:** "Hi, I'm Alex. Full-stack developer passionate about building things."
**Strong:** "Alex Chen — ConTech engineer in Hong Kong. I turn messy site operations into live systems operators actually use."

Identity formula:

```
[Name] — [domain] [altitude] in [place]
[One sentence: who benefits + what changes because of them]
[CTA]  [secondary: See selected work]
```

Altitude words that read as senior: engineer, designer, researcher, builder, operator — paired with a domain (ConTech, payments, infra, product). Avoid stacking "Full-Stack / Frontend / Backend / Ninja / Guru."

## What to emphasize (and what to hide)

Show if it proves judgment or outcomes. Hide if it only proves they have been busy.

| Show | Hide unless asked |
|------|-------------------|
| 2–4 selected works with stakes and results | Every tutorial, bootcamp, or clone app |
| Role and *decision*, not just tools | Exhaustive tech lists |
| Metrics only when real and checkable | "Improved performance by 50%" with no baseline |
| Personality in word choice and what they chose to build | "Fun facts," Myers-Briggs, zodiac |
| How they collaborate (written, async, on-site) | Soft-skill adjectives with no scene |
| Languages / work authorization if relevant to the market | Visa essays on the hero |
| Photo if it looks like them at work-level polish | Stock, AI face, or a heavily filtered selfie |
| Writing, talks, open source *if* they exist | Empty "Blog coming soon" |

Hong Kong / APAC hiring: put **city + remote stance** near the hero. Bilingual sites: English first unless the user writes primarily in Chinese; keep `zh-HK` as a toggle, not auto-translated fluff.

## Selected work (the site's core)

Each case study is a short argument, not a gallery caption.

Required shape:

1. **Title** — the outcome or the system, not the repo name
2. **Context** — who it was for, what was broken (2 sentences)
3. **Role** — what they owned vs what others owned
4. **Decisions** — 2–3 choices that reveal taste (stack, constraint, tradeoff)
5. **Result** — qualitative is fine if honest; quantitative only if true
6. **Artifact** — live link, repo, or a still. Never a grey box "image here" in a final pass

Card-on-grid is allowed as a *scan* layer; at least the first two works must expand in-page (or link to `/work/:slug`) so a manager can go deep without leaving.

Do not lead with the tech stack. Lead with the problem. Tools belong in a one-line meta row: `React · Tailwind · on-site telemetry`.

## Experience

This is not a CV paste. Each role: company, title, dates, **3 bullets max**.

Bullet test: if you delete the company name, would a skeptic still believe the claim?

- Weak: "Responsible for developing the frontend."
- Strong: "Replaced a weekly Excel crane log with a live overlay the night shift actually kept open."

Collapse internships and short gigs into one line if they dilute seniority. Education: one line unless the user is early-career (then it may sit higher).

## About — personality without a costume

Personality is **specificity**, not jokes or a neon "creative" theme.

Pick 3–5 true details:

- What they optimize for (clarity, uptime, craft, teaching)
- A working constraint they respect (site wifi, bilingual stakeholders, 3am ops)
- Taste: a book, a building, a tool, a standard they actually use
- How they like to work with hiring teams (scope first, then build)

Avoid: "I love coffee and travel." Avoid fake vulnerability. A short first-person paragraph + 3 specifics beats a manifesto.

If there is a portrait: one, well cropped, consistent with the palette. Caption it with something human ("On a 4S site walkthrough, 2026") not "That's me!"

## Skills

Skills are an index into the work, not a competency carnival.

- Group by how the owner thinks (Systems, Interface, Field) not by buzzword (Frontend/Backend)
- 8–14 items total
- Every headline skill should appear in at least one case study
- No progress bars, no GitHub-style language pie unless the user wants a live contribution proof and you fetch real data

## Contact

One primary action: `mailto:` or a form that sends email without a backend if possible (`mailto` is enough). Secondary: LinkedIn, GitHub. Optional: calendar, CV PDF in `public/`.

Copy should sound like a person:

- Weak: "Feel free to reach out!"
- Strong: "Hiring for ConTech or site-systems work in HK? Email me — I read everything."

Do not hide email behind a contact form that needs an API key. Do not open Calendly as a modal on first visit.

## Voice

- First person in About and Contact; third-person fragments are fine in case-study meta
- Short sentences. Concrete nouns. Cut "leverage," "utilize," "passionate," "synergy," "robust," "seamless"
- Match the owner's real register. If they are dry and precise, do not write punchy startup-bro copy
- Same terminology everywhere: "case study" or "selected work," not mixing "projects / works / portfolio items"

## Copy checklist before visual polish

- [ ] Hero is specific enough to reject the wrong jobs
- [ ] First case study has stakes, a decision, and a result
- [ ] No invented numbers or employers
- [ ] About contains at least two details that could only be this person
- [ ] Contact states who should write and what happens next
- [ ] Page title and meta description repeat the identity, not "Portfolio | Home"
