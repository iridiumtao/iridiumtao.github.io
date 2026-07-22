# Iridium Portfolio

The personal portfolio of **Chun-Ju "Iridium" Tao (歐東)** — a statically exported Next.js
site with a hand-built editorial design ("Wood"), served from GitHub Pages at
**<https://chun-ju.irilia.app>**.

`iridiumtao.github.io` 301-redirects to the custom domain. The domain is configured in the
repository's **GitHub Pages settings**; there is deliberately no `CNAME` file in the repo.

## Features

- **Static export, no server.** `next build` emits a fully static `out/`. No runtime, no
  database, no server-side rendering in production.
- **Project showcase pages.** Every project on the home page links to its own case-study
  page at `/projects/<slug>`, rendered from Markdown.
- **Single content source.** All copy lives in `data/portfolio.json`, typed end to end.
- **Résumé page** with the timeline and per-role PDF downloads, generated at build time.
- **Self-hosted, subsetted fonts.** No external font requests; the CJK face is subsetted on
  every build from the glyphs actually used.
- **Dev-only content editor** at `/edit`, structurally excluded from production builds.
- **Strict TypeScript** across the whole codebase, with a test suite on `node --test`.

> **Dark mode is not implemented.** `next-themes` is still wired up in `_app.page.tsx` and
> flips `<body>` to black, but the `.we` surface that renders every visible page is
> light-only — adding the `dark` class leaves the site unchanged. Treat the provider as
> vestigial until a dark palette is actually designed.

## Prerequisites

- **Node.js 24** — pinned in `.nvmrc`. The build scripts are `.ts` files executed directly
  by Node's type-stripping, which needs a recent Node to run without flags.
- **Yarn 1.22.22** — declared via `packageManager` in `package.json`.

## Getting started

```bash
yarn install
```

```bash
yarn dev
```

Then open <http://localhost:3000>. The dev-only editor is available at `/edit` in this mode.

`predev` runs `scripts/prepare-resumes.ts` and `scripts/subset-font.ts` first, so the résumé
PDFs and the font subset are regenerated before the server starts.

## Scripts

| Script           | What it does                                                      |
| ---------------- | ----------------------------------------------------------------- |
| `yarn dev`       | Dev server (SSR mode, editor + API routes live)                   |
| `yarn build`     | Static export to `out/`                                           |
| `yarn test`      | `node --test` — the suite in `lib/*.test.ts`, `scripts/*.test.ts` |
| `yarn typecheck` | `tsc --noEmit`                                                    |
| `yarn lint`      | `eslint .`                                                        |
| `yarn format`    | `prettier --write .`                                              |

`yarn start` does **not** work — a static export has nothing to serve. To preview the
production build locally:

```bash
yarn build && npx serve out
```

## Deployment

**Pushing to `master` deploys.** `.github/workflows/deploy.yml` builds the site and
publishes `out/` through `actions/deploy-pages`. That workflow is the only deploy path —
there is no `gh-pages` branch and no `yarn deploy` script. Both were removed because a
branch-based publish would have overwritten Pages with a `CNAME`-less `out/` and broken the
custom domain. Do not reintroduce them.

CI runs `subset-font.ts` and the test suite before building. It deliberately does **not**
run `prepare-resumes.ts` — see the résumé note below.

## Content

### `data/portfolio.json`

The single source of content for every page. Read it in code only through the typed
accessor, never by importing the raw JSON:

```ts
import data from "@/lib/portfolio";
```

`lib/portfolio.ts` applies a `satisfies PortfolioData` check (types in `types/portfolio.ts`),
so a content edit that breaks the expected shape fails `yarn typecheck` in one place instead
of blowing up silently at a call site.

Top-level keys: `name`, `socials`, `projects`, `experiences`, `aboutpara`, `home`, `resume`,
plus the `showCursor` / `darkMode` / `showResume` flags inherited from the original template.

A real project entry, verbatim from the file:

```json
{
  "id": "4",
  "slug": "retailpia",
  "title": "Retailpia",
  "subtitle": "Winner of Better Retail, Level-Up Society Hackathon, organized by ShowCode",
  "techStack": [],
  "startDate": "July 2021",
  "endDate": "July 2021",
  "description": "Developed a city-building game that also included the additional feature of being an account book app and a points collector with students from four universities within 48 hours.",
  "imageSrc": "/images/projects/retailpia.png",
  "url": "https://github.com/iridiumtao/Retailpia",
  "demoUrl": null,
  "role": null,
  "problem": null,
  "process": null,
  "outcome": null
}
```

`subtitle` and `demoUrl` are optional. `subtitle` renders under the card title, so it should
say something the tech chips don't already say.

`role` / `problem` / `process` / `outcome` are `null` on purpose. They are first-person
narrative fields about a real person's work — they get written by hand, never generated.

Résumé skills are grouped under `resume.skills` as `languages`, `cloudAndDevOps`,
`frameworksAndBackend`, and `dataAndML`.

### Project case studies

The long-form body of each showcase page is a Markdown file in `_projects/`, matched to its
JSON entry by `slug`. `lib/projects.ts` joins the two.

`lib/projects.ts` is the **only** module allowed to touch the filesystem for project data. It
must never be imported from `components/wood/*` — enforced both by a runtime
`assertServerOnly()` throw and by an ESLint `no-restricted-imports` rule.

### Résumés

`public/resumes/*.pdf` is **build output** — never hand-edit it. Drop a new PDF into `docs/`
following the naming convention `Chun-Ju Tao Resume <purpose> <year> v<version>.pdf`, then
run `yarn dev` or `yarn build`; `scripts/prepare-resumes.ts` picks the highest version per
purpose and copies it to `public/resumes/resume-<purpose>.pdf`. **Commit the result** — those
four files are tracked.

This is why CI does not run that script: `docs/` is gitignored, and the script clears
`public/resumes/` before copying, so on a CI checkout it would replace the current résumés
with the handful of stale PDFs that predate the ignore rule.

## Project structure

```text
iridium-portfolio/
├── _projects/              # Markdown bodies for the showcase pages (8)
├── components/wood/        # The only components: Nav, Footer, ProjectCard (.tsx)
├── data/portfolio.json     # Single content source
├── docs/                   # Résumé PDF drop box (gitignored)
├── lib/
│   ├── analytics.ts        # GoatCounter snippet
│   ├── blogRedirects.ts    # Legacy /blog/<slug> → /projects/<slug> map
│   ├── portfolio.ts        # Typed accessor for portfolio.json
│   ├── projects.ts         # Server-only project data (JSON + Markdown)
│   └── site.ts             # SITE_ORIGIN
├── pages/
│   ├── api/portfolio.page.ts   # Dev-only writer for the editor
│   ├── blog/[slug].page.tsx    # Redirect shim for the old live blog URLs
│   ├── projects/[slug].page.tsx
│   ├── index.page.tsx
│   ├── resume.page.tsx
│   ├── cjk-specimen.page.tsx   # Unlinked noindex CJK type specimen
│   ├── edit.dev.tsx            # Dev-only editor
│   ├── 404.page.tsx
│   ├── _app.page.tsx
│   └── _document.page.tsx
├── scripts/
│   ├── prepare-resumes.ts  # docs/*.pdf → public/resumes/ (local only)
│   └── subset-font.ts      # CJK font subsetting (+ .test.ts)
├── styles/
│   ├── fonts.ts            # next/font declarations
│   └── globals.css         # The entire Wood design system
├── types/portfolio.ts
├── utils/markdownToHtml.ts
├── eslint.config.mjs
├── next.config.js
├── postcss.config.js
├── prettier.config.mjs
└── tsconfig.json
```

## Conventions

- **Pages must be named `<name>.page.tsx`.** `next.config.js` sets `pageExtensions` to only
  the `.page.*` forms. A page file without that infix **silently vanishes from the production
  build** — no error, no warning. The dev-only editor uses `.dev.tsx`, which is how it is kept
  out of production by structure rather than by a `NODE_ENV` check.
- **Wood components are flat `PascalCase.tsx`** under `components/wood/`.
- Everything else is `camelCase.ts`; `kebab-case.ts` for the two build scripts.
- 2-space indent, double quotes, English-only code comments.
- Prop types are declared inline in TypeScript. No `PropTypes`, no JSDoc type blocks.

## Styling

There is no `tailwind.config.js` — Tailwind v4 is configured entirely in CSS. Design tokens
live in the `@theme` block at the top of `styles/globals.css`, and the whole editorial design
is hand-written CSS scoped under `.we` in the same file. That single file is the place to
change how the site looks.

## Stack

**Runtime:** Next.js 16.2.10 (Pages Router) · React 19.2.7 · TypeScript 5.9.3 (`strict`) ·
Tailwind CSS 4.3.2 · next-themes 0.4.6 · gray-matter · remark / remark-html

**Tooling:** ESLint 9.39.5 + eslint-config-next · Prettier 3.9.5 · fontkit + subset-font ·
`node --test` (no test framework dependency)

## Acknowledgments

Originally built on the [React Portfolio Template](https://github.com/chetanverma16/react-portfolio-template)
by [@chetanverma16](https://github.com/chetanverma16) (Chetan Verma). Little of that template
remains — its component tree was replaced outright by the Wood design — but it was the
foundation this site grew from, and the thanks stand.

---

Built with ❤️ by Chun-Ju (Iridium) Tao
