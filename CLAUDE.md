# Iridium Portfolio — Wood Editorial Redesign

The personal portfolio site of Chun-Ju "Iridium" Tao (歐東 / iridiumtao). Next.js **Pages
Router**, **statically exported** to GitHub Pages. A real, live shopfront for his work — not a
toy project — meant to live and be iterated on for 5+ years.

The current milestone finishes the "Wood Editorial" redesign: move the site off its legacy
7-year-old template components onto the Wood component system, turn the old blog into clickable
project showcase pages, and ship it clean. `.planning/ROADMAP.md` is the map (gitignored).

## Who the owner is

- **Chun-Ju "Iridium" Tao (歐東)** — M.S. Computer Engineering at NYU, graduating May 2026.
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

The repo started from a template that is 7+ years old, and two visual systems still coexist:

- **Wood (active):** `components/wood/*` — flat `PascalCase.js` files. Used by `pages/index.js`
  and `pages/resume.js`.
- **Legacy (dying):** `components/{Header,Footer,Button,ContentSection,BlogEditor,…}` — only
  `pages/blog/*` and `pages/edit.js` still import them. `ProjectCard`, `ProjectResume`,
  `WorkCard` are **already orphaned** (`Socials` is still imported by the legacy `Footer`).

**Strangler-fig rule:** never delete a legacy piece before its Wood replacement is built and
verified. Build the new surface first, delete last.

**Modernizing old patterns — the boundary:**

- Already editing a file and hit something outdated? **Fix it in passing** — that's wanted, not
  scope creep. This is the intentional exception to GSD's "no edits outside a workflow" rule.
- **Don't go hunting** in files the task doesn't touch — report it instead. Bigger
  modernization candidates belong in **planning**, not mid-execution.

## Conventions

- **Wood components: flat `PascalCase.js` under `components/wood/`** — a deliberate deviation
  from the legacy `PascalCase/index.js` directories. New components follow the flat pattern.
- Pages and utilities: `camelCase.js`. `UPPER_SNAKE_CASE` for module-level lookup tables.
- 2-space indent, double quotes.
- File-header comment naming the file's role; helpers grouped under a `/* ── Helpers ── */`
  banner above the main component (see `pages/index.js`).
- Error handling: `try/catch` around file I/O only — log and return a safe fallback (`null`,
  `[]`) rather than throwing.
- No PropTypes, no JSDoc type blocks — default parameter values carry prop defaults.
- **`data/portfolio.json` is the single content source** for every page. Extend the JSON rather
  than hardcoding content into components.
- **`lib/projects.ts` is the only module that touches the filesystem for project data**, and it
  must never be imported from `components/wood/*` — enforced by a runtime `assertServerOnly()`
  throw *and* an ESLint `no-restricted-imports` rule.

## Live site & deploy — verify, don't assume

- **Canonical URL is `https://chun-ju.irilia.app`**, NOT `iridiumtao.github.io` (that 301s to
  it — non-technical readers mistake `github.io` for GitHub). Use it for OG tags and canonical
  links. The domain lives in **GitHub Pages Settings**; there is **no `CNAME` file** in the repo.
- **`.github/workflows/deploy.yml` (Actions) is the real deploy path.** The `gh-pages` branch is
  dead (last commit 2025-09-18).
- ⚠️ **Don't run `yarn deploy`** (`gh-pages -d out`) — a branch-based publish that would
  overwrite Pages with a `CNAME`-less `out/`. Slated for removal.
- **The live site is still the OLD design** (redesign lives on `new-design`), and old
  `/blog/<slug>` showcase pages are **live at HTTP 200** — real URLs worth redirecting.

## Gotchas

- **Never hand-edit build output:** `public/resumes/*.pdf` and the font subset are regenerated
  every `predev`/`prebuild` by `scripts/prepare-resumes.js` and `scripts/subset-font.js`.
- `node --test <dir>` breaks on this Node build (treats the path as a script). Use bare
  `node --test`.
- **`.claude/CLAUDE.md` is generated by GSD** from `.planning/` sources (note the
  `<!-- GSD:*-start source:… -->` markers) and its stack facts are **stale**. Don't hand-edit it;
  it gets regenerated. This file is the hand-maintained one — prefer it on conflict.
- **`.planning/` is gitignored** and GSD's `commit_docs` is `false` — `gsd-tools query commit`
  reporting `committed: false` for planning docs is expected, not a failure.
