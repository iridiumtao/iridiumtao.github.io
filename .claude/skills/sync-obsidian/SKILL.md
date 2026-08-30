---
name: sync-obsidian
description: >-
  Sync site copy between this repo and the owner's Obsidian "網站文案" vault folder.
  Use when the user says things like「把文案同步到 obsidian」,「同步回網站」,「sync
  obsidian copy」, or otherwise wants to move editable copy between
  data/portfolio*.json + _projects/*.md + lib/dictionary.ts and the vault.
---

# sync-obsidian

The Obsidian folder is an editable mirror of every en/中文 string on the site, so
the owner can hand-edit copy offline in Obsidian.

- **Vault folder**: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Vault/40 Projects 專案/Iridium Portfolio 網站文案/`
- **Guide (read it first, both directions)**: `<vault folder>/00-README-同步匯出入指南.md`

## Direction 1 — repo → Obsidian (export)

Regenerate the vault files from the repo's current content:

```
node scripts/export-copy-to-obsidian.mjs
```

Defaults the output to the vault folder above; override with a path arg or
`OBSIDIAN_COPY_DIR=…`. One-way and verbatim — no rewriting, no cross-locale
fallback. It overwrites `01`–`04` and `05-專案介紹頁/*.md`; it never touches
`00-README`. Safe to re-run.

Afterwards, `git status` will be clean (only the vault changed). Report which
fields changed by diffing before/after if the user wants a summary.

## Direction 2 — Obsidian → repo (import)

There is **no script** for this. Read
`<vault folder>/00-README-同步匯出入指南.md` and follow its "匯入回 repo 時" steps:

1. For `01`–`04`: match each `#### path` block's EN / 中文 against the current
   value in `data/portfolio.json` / `data/portfolio.zh.json` / `lib/dictionary.ts`
   and edit only the fields that differ. The backtick path is the exact JSON
   location (`.key`, `[index]`).
2. For `05-專案介紹頁/<slug>.md`: overwrite `_projects/<slug>.md` with the EN code
   block and `_projects/<slug>.zh.md` with the 中文 code block, frontmatter
   included.
3. Never fill a missing 中文 value from EN (or vice versa) — leave it blank and
   report it.
4. Run `yarn typecheck` and `yarn test` (the latter guards against
   mainland-Chinese terms / leftover English). Run `yarn lint` if JSON shape
   changed.
5. Don't commit or push to `master` without the owner's say-so.
