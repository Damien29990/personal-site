# Damien Yu

Personal site for Damien Yu, a ConTech engineer in Hong Kong. React, Tailwind CSS, and Next.js.

```bash
npm install
npm run dev
```

Edit copy in `src/content/site.ts`.

## GitHub Pages

This is a Next.js app. The GitHub repo page still shows the README; the live site is a **Pages** URL after the Action runs:

`https://damienecgoal.github.io/personal-site/`

1. In the repo: **Settings → Pages → Source → GitHub Actions**
2. Commit and push `main` (GitHub Desktop is fine)

`npm run build` writes static HTML into `out/` (`output: "export"`). Do not commit `out/` or `node_modules`.
