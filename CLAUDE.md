# Iridium Portfolio — Wood Editorial Redesign

The personal portfolio site of Chun-Ju "Iridium" Tao (歐東 / iridiumtao). Next.js **Pages
Router**, **statically exported** to GitHub Pages. A real, live shopfront for his work — not a
toy project — meant to live and be iterated on for 5+ years.

The "Wood Editorial" redesign was built in milestone v1.0 (site moved off its legacy 7-year-old
template components onto the Wood component system, the old blog became clickable project
showcase pages, legacy component tree deleted outright), hardened in v2.0 (strict TypeScript,
known defects and tooling gaps cleared), and polished in v2.1.0 (copy, résumé, layout, palette).

**It went live on 2026-07-22.** PR #1 merged `new-design` into `master`, and the live site now
serves the Wood design. v1.0 and v2.0 were both deliberately build-only; that constraint is
over — **`master` is production now, and every push to it deploys.**
`.planning/ROADMAP.md` is the map (gitignored).

## Who the owner is

- **Chun-Ju "Iridium" Tao (歐東)** — M.S. Computer Engineering at NYU, graduated May 2026.
  Based between **New York and Taipei**. A **Taiwanese person living in the US**.
- Specializes in **MLOps, applied ML, and scalable cloud systems** (Python, Go, Docker,
  Terraform, AWS, PyTorch, MLflow). Interned at Micron, CARITY AI, MoBagel, Mindtronic AI.
- This is his own portfolio, so **content accuracy is personal, not cosmetic** — a fabricated
  claim here is a lie about a real person's record.

### Language — strict

- Reply in **English or Traditional Chinese (Taiwan)**. "Chinese" always means **Taiwan
  Traditional Chinese**.
- **Never** use Simplified Chinese or mainland-Chinese vocabulary/terminology. This is a hard
  rule, not a preference.
- When the site later ships Chinese content, it must be **fluent, native Taiwan Traditional
  Chinese**. Do not translate literally — internalize the meaning and **re-express it natively
  in Chinese**. Avoid translationese (翻譯腔) and Europeanized syntax (歐化中文).
- **Code comments are English-only**, regardless of conversation language.

## Principles

- **Never fabricate.** Read the real file before writing a parser or generator; test against
  real data; verify against the live site rather than assuming. This is why every project's
  `role`/`problem`/`process`/`outcome` field is `null` — the owner writes that prose himself.
  Leave it empty rather than inventing it.
- **Static export, no server.** `next.config.js` sets `output: 'export'`. `pages/api/*` runs
  only in `next dev` and is absent from the export. Every redirect is client-side; every data
  read is build-time. No `basePath` (user page at root); `public/.nojekyll` required.
- **Optimize for the owner tweaking design later**, and favor stable, boring, well-supported
  tools — he hand-edits this site often and it has a 5-year horizon.
- **Responsive and cross-browser is fundamental, not polish.** Over half of this site's visitors
  read it on an iPhone. Phone, tablet, and desktop across Safari, Chromium, and Firefox are all
  first-class targets — Mobile Safari most of all. A layout that only holds up on a laptop is
  broken, not nearly done.
- **Design mobile-first and verify at real viewport widths** — "never fabricate" applies to
  layout too. Calling a screen responsive after reading the CSS is a guess, not evidence.

## Working on a 7-year-old base

The repo started from a template that is 7+ years old. Its legacy component tree
(`components/{Header,Footer,Button,ContentSection,BlogEditor,ProjectCard,WorkCard,
ProjectResume,Socials}`) was **deleted outright in v1.0** — `components/` now contains only
`components/wood/*` (flat `.tsx` files: `Nav`, `Footer`, `ProjectCard`). There is a single
design system now, not two coexisting ones. The old blog was repurposed into project showcase
pages: `pages/blog/[slug].page.tsx` is a redirect shim from the 8 legacy `/blog/<slug>` URLs
onto the new `/projects/<slug>` routes, and `pages/edit.dev.tsx` is a dev-only content editor
excluded from the production build via `pageExtensions` (not a `NODE_ENV` check).

**Strangler-fig rule (historical):** while the legacy tree still existed, the rule was never
delete a legacy piece before its Wood replacement is built and verified — build the new surface
first, delete last. The migration is complete, so this is a record of how it was done, not a
live constraint on today's single-system codebase.

**Modernizing old patterns — the boundary:**

- Already editing a file and hit something outdated? **Fix it in passing** — that's wanted, not
  scope creep. This is the intentional exception to GSD's "no edits outside a workflow" rule.
- **Don't go hunting** in files the task doesn't touch — report it instead. Bigger
  modernization candidates belong in **planning**, not mid-execution.

## Conventions

- **Wood components: flat `PascalCase.tsx` under `components/wood/`** — a deliberate deviation
  from the old `PascalCase/index.js` directory convention the now-deleted legacy tree used.
- Pages: `camelCase.page.tsx` (`.page.ts` for API routes). The `.page.` infix is required by
  `next.config.js`'s `pageExtensions` — a page file without it silently vanishes from the
  production export. The dev-only editor is `pages/edit.dev.tsx` (`.dev.` infix, excluded from
  production the same way). Utilities/lib/scripts: `camelCase.ts` (`kebab-case.ts` for
  `scripts/prepare-resumes.ts` and `scripts/subset-font.ts`). `UPPER_SNAKE_CASE` for
  module-level lookup tables.
- 2-space indent, double quotes.
- File-header comment naming the file's role; helpers grouped under a `/* ── Helpers ── */`
  banner above the main component (see `pages/index.page.tsx`).
- Error handling: `try/catch` around file I/O only — log and return a safe fallback (`null`,
  `[]`) rather than throwing.
- **TypeScript prop types, not PropTypes/JSDoc**: components declare inline prop types (e.g.
  `{ home?: boolean }`) with default parameter values carrying prop defaults — no `PropTypes`
  package, no JSDoc `@param` type blocks.
- **`data/portfolio.json` is the single content source** for every page. Extend the JSON rather
  than hardcoding content into components. Read it only through `lib/portfolio.ts`'s typed
  accessor (`import data from "@/lib/portfolio"`), never by importing the raw JSON directly —
  the accessor's `satisfies PortfolioData` check catches a content edit that breaks the shape at
  `yarn typecheck` time, in one place, instead of silently at a call site.
- **`lib/projects.ts` is the only module that touches the filesystem for project data**, and it
  must never be imported from `components/wood/*` — enforced by a runtime `assertServerOnly()`
  throw *and* an ESLint `no-restricted-imports` rule.

## Live site & deploy — verify, don't assume

- **Canonical URL is `https://chun-ju.irilia.app`**, NOT `iridiumtao.github.io` (that 301s to
  it — non-technical readers mistake `github.io` for GitHub). Use it for OG tags and canonical
  links. The domain lives in **GitHub Pages Settings**; there is **no `CNAME` file** in the repo.
- **`.github/workflows/deploy.yml` (Actions) is the real deploy path.** The `gh-pages` branch is
  dead (last commit 2025-09-18). The `yarn deploy` script and the `gh-pages` devDependency were
  removed in v2.0 (HYG-02) — that branch-based publish would have overwritten Pages with a
  `CNAME`-less `out/`. Do not reintroduce it.
- **The live site serves the Wood design as of 2026-07-22.** `master` is production: any push
  to it triggers `deploy.yml` and replaces the live site within ~2 minutes. Treat a push to
  `master` as a deploy, and confirm before making one.
- The old `/blog/<slug>` URLs were live at HTTP 200 before the cutover, which is why
  `pages/blog/[slug].page.tsx` exists as a redirect shim. Keep it.

## Gotchas

- **Never hand-edit build output:** `public/resumes/*.pdf` and the font subset are regenerated
  every `predev`/`prebuild` by `scripts/prepare-resumes.ts` and `scripts/subset-font.ts`.
- **Résumé PDFs are generated locally only.** CI (`.github/workflows/deploy.yml`) invokes the
  `next` binary directly, so it bypasses the `prebuild` hook and runs the build scripts as an
  explicit step — but that step runs **only `subset-font.ts`**. `prepare-resumes.ts` is
  deliberately excluded: it reads `docs/`, which is **gitignored** (a dozen older PDFs predate
  the ignore rule and are still tracked), and it **clears `public/resumes/` before copying**, so
  on a CI checkout it would replace the current résumés with those stale leftovers. The four
  `public/resumes/*.pdf` are tracked; regenerate them locally with `yarn dev`/`yarn build` after
  dropping a new PDF into `docs/`, and commit the result.
- `node --test <dir>` breaks on this Node build (treats the path as a script). Use bare
  `node --test`.
- **`.claude/CLAUDE.md` is generated by GSD** from `.planning/` sources (note the
  `<!-- GSD:*-start source:… -->` markers) and its stack facts are **stale**. Don't hand-edit it;
  it gets regenerated. This file is the hand-maintained one — prefer it on conflict.
- **`.planning/` is gitignored** and GSD's `commit_docs` is `false` — `gsd-tools query commit`
  reporting `committed: false` for planning docs is expected, not a failure.
