// scripts/export-copy-to-obsidian.mjs
// One-way exporter: regenerate the owner's Obsidian "網站文案" vault folder from
// this repo's content sources so he can hand-edit copy off-repo, offline, on any
// device. The reverse direction (Obsidian edits back into the repo) is done by
// hand following that folder's 00-README-同步匯出入指南.md — this script only
// writes the export, it never reads it back.
//
// Content is copied VERBATIM: no rewriting, no translation, no cross-locale
// fallback. A field that is empty in a source file stays empty here.
//
// Sources:
//   - data/portfolio.json / data/portfolio.zh.json  (top-level, home, socials,
//     experiences, projects[], resume)
//   - _projects/<slug>.md / _projects/<slug>.zh.md  (full showcase-page bodies)
//   - lib/dictionary.ts                             (UI chrome strings)
//
// Output layout (matches the format that folder's 00-README documents):
//   01-首頁與關於.md  02-作品卡片.md  03-履歷.md  04-介面文字.md
//   05-專案介紹頁/<slug>.md
//
// ESM (.mjs) because package.json has no "type": "module" and the other scripts/
// files use CommonJS require(); this one is standalone and not wired into any
// predev/prebuild hook.
//
// Usage:
//   node scripts/export-copy-to-obsidian.mjs [outDir]
//   OBSIDIAN_COPY_DIR=/path/to/vault/folder node scripts/export-copy-to-obsidian.mjs
// Default outDir is the owner's local iCloud vault path.

import fs from "node:fs";
import path from "node:path";

const REPO = process.cwd();
const OUT =
  process.argv[2] ||
  process.env.OBSIDIAN_COPY_DIR ||
  path.join(
    process.env.HOME || "",
    "Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Vault",
    "40 Projects 專案/Iridium Portfolio 網站文案",
  );

const en = JSON.parse(fs.readFileSync(path.join(REPO, "data/portfolio.json"), "utf8"));
const zh = JSON.parse(fs.readFileSync(path.join(REPO, "data/portfolio.zh.json"), "utf8"));

/* ── Helpers ─────────────────────────────────────────────────────────── */

// A value rendered as a Markdown blockquote. Arrays become "> - item" lists;
// an empty value is a single "> " line; multi-paragraph strings keep their
// blank lines as "> ".
function bq(v) {
  if (Array.isArray(v)) {
    if (v.length === 0) return "> ";
    return v.map((i) => `> - ${i}`).join("\n");
  }
  const s = v == null ? "" : String(v);
  if (s === "") return "> ";
  if (s.includes("\n")) {
    return s
      .split("\n")
      .map((l) => (l === "" ? "> " : `> ${l}`))
      .join("\n");
  }
  return `> ${s}`;
}

// One "#### `path`" field block with EN / 中文 blockquotes. No trailing newline;
// callers join blocks with "\n" (tight) or "\n\n" (blank line between).
function F(pathStr, enVal, zhVal) {
  return `#### \`${pathStr}\`\n\n**EN**\n${bq(enVal)}\n\n**中文**\n${bq(zhVal)}`;
}

const norm = (s) => (s.endsWith("\n") ? s : s + "\n");

/* ── 01 首頁與關於 ───────────────────────────────────────────────────── */

function file01() {
  let out = "# 首頁與關於 · Home & About\n\n";
  out +=
    "> 對應來源：`data/portfolio.json` / `data/portfolio.zh.json`（頂層欄位、`home`、`socials`、`experiences`）\n\n---\n\n";

  out += "## 基本資料\n\n";
  out += [F("name", en.name, zh.name), F("aboutpara", en.aboutpara, zh.aboutpara)].join("\n\n");
  out += "\n\n---\n\n";

  out += "## 社群連結 `socials[]`\n\n";
  const soc = [];
  en.socials.forEach((s, i) => {
    soc.push(F(`socials[${i}].title`, s.title, zh.socials[i].title));
    soc.push(F(`socials[${i}].link`, s.link, zh.socials[i].link));
  });
  out += soc.join("\n");
  out += "\n\n---\n\n";

  out += "## 首頁 `home`\n\n";
  const homeKeys = [
    "greeting",
    "availability",
    "heroLines",
    "lede",
    "based",
    "degree",
    "stack",
    "honorsShort",
    "from",
    "aboutPull",
    "contactEmail",
    "projectCount",
  ];
  out += homeKeys.map((k) => F(`home.${k}`, en.home[k], zh.home[k])).join("\n\n");
  out += "\n\n\n---\n\n";

  out += "## 工作經歷（首頁短版）`experiences[]`\n\n";
  const exp = [];
  en.experiences.forEach((e, i) => {
    exp.push(F(`experiences[${i}].title`, e.title, zh.experiences[i].title));
    exp.push(F(`experiences[${i}].description`, e.description, zh.experiences[i].description));
  });
  out += exp.join("\n");
  out += "\n";
  return out;
}

/* ── 02 作品卡片 ─────────────────────────────────────────────────────── */

function file02() {
  let out = "# 作品卡片文案 · Project Cards\n\n";
  out +=
    "> 對應來源：`data/portfolio.json` / `data/portfolio.zh.json` 的 `projects[]`（首頁卡片與各專案的基本欄位；不含專案介紹頁全文，那在 `05-專案介紹頁/`）\n\n---\n\n";

  en.projects.forEach((p, i) => {
    const z = zh.projects[i];
    out += `## ${p.slug}\n\n`;
    const fields = [F(`projects[${i}].title`, p.title, z.title)];
    if ("subtitle" in p) fields.push(F(`projects[${i}].subtitle`, p.subtitle, z.subtitle));
    fields.push(F(`projects[${i}].techStack`, p.techStack, z.techStack));
    fields.push(F(`projects[${i}].startDate`, p.startDate, z.startDate));
    fields.push(F(`projects[${i}].endDate`, p.endDate, z.endDate));
    fields.push(F(`projects[${i}].description`, p.description, z.description));
    out += fields.join("\n");
    out += "\n\n---\n\n";
  });
  return out;
}

/* ── 03 履歷 ─────────────────────────────────────────────────────────── */

function file03() {
  const re = en.resume;
  const rz = zh.resume;
  let out = "# 履歷文案 · Résumé\n\n";
  out += "> 對應來源：`data/portfolio.json` / `data/portfolio.zh.json` 的 `resume`\n\n---\n\n";

  out += [
    F("resume.tagline", re.tagline, rz.tagline),
    F("resume.description", re.description, rz.description),
  ].join("\n\n");
  out += "\n\n---\n\n";

  out += "## 工作經歷 `resume.experiences[]`\n\n";
  re.experiences.forEach((e, i) => {
    const z = rz.experiences[i];
    out += `### ${e.position}\n\n`;
    const f = [
      F(`resume.experiences[${i}].position`, e.position, z.position),
      F(`resume.experiences[${i}].location`, e.location, z.location),
      F(`resume.experiences[${i}].type`, e.type, z.type),
      F(`resume.experiences[${i}].dates`, e.dates, z.dates),
    ];
    e.bullets.forEach((b, bi) =>
      f.push(F(`resume.experiences[${i}].bullets[${bi}]`, b, z.bullets[bi])),
    );
    out += f.join("\n");
    out += "\n\n";
  });
  out += "\n---\n\n";

  out += "## 學歷 `resume.education[]`\n\n";
  re.education.forEach((e, i) => {
    const z = rz.education[i];
    out += `### ${e.universityName}\n\n`;
    const f = [
      F(`resume.education[${i}].universityName`, e.universityName, z.universityName),
      F(`resume.education[${i}].location`, e.location, z.location),
      F(`resume.education[${i}].degree`, e.degree, z.degree),
      F(`resume.education[${i}].relevantCoursework`, e.relevantCoursework, z.relevantCoursework),
    ];
    out += f.join("\n");
    out += "\n\n";
  });
  out += "\n---\n\n";

  out +=
    "## 技能分類標籤 `resume.skills` _（技能項目本身通常是專有名詞，未逐條列出中英對照，只列分類標籤）_\n\n";
  for (const [k, v] of Object.entries(re.skills)) {
    out += `- ${k}: ${v.join(", ")}\n`;
  }
  out += "\n\n---\n\n";

  out += "## 履歷專案 `resume.projects[]`\n\n";
  re.projects.forEach((p, i) => {
    const z = rz.projects[i];
    out += `### ${p.title}\n\n`;
    const f = [
      F(`resume.projects[${i}].title`, p.title, z.title),
      F(`resume.projects[${i}].organization`, p.organization, z.organization),
      F(`resume.projects[${i}].location`, p.location, z.location),
      F(`resume.projects[${i}].dates`, p.dates, z.dates),
    ];
    p.details.forEach((d, di) =>
      f.push(F(`resume.projects[${i}].details[${di}]`, d, z.details[di])),
    );
    out += f.join("\n");
    out += "\n\n";
  });
  out += "\n---\n\n";

  out += "## 榮譽獎項 `resume.honors[]`\n\n";
  const honorKeys = ["title", "event", "organization", "organizer", "location"];
  re.honors.forEach((h, i) => {
    const z = rz.honors[i];
    out += `### ${h.title}\n\n`;
    const f = [];
    for (const k of honorKeys) {
      if (k in h) f.push(F(`resume.honors[${i}].${k}`, h[k], z[k]));
    }
    out += f.join("\n");
    out += "\n\n";
  });
  return out;
}

/* ── 04 介面文字 ─────────────────────────────────────────────────────── */

function file04() {
  const src = fs.readFileSync(path.join(REPO, "lib/dictionary.ts"), "utf8");
  // Pull `key: "value",` lines out of the DICTIONARY.en / DICTIONARY.zh records
  // (4-space indent, one per line). Comment lines and the type block don't match.
  function parseRecord(name) {
    const start = src.indexOf(`  ${name}: {`);
    const end = src.indexOf("\n  },", start);
    const body = src.slice(start, end);
    const map = new Map();
    for (const line of body.split("\n")) {
      const m = line.match(/^\s{4}(\w+): "(.*)",\s*$/);
      if (m) map.set(m[1], m[2].replace(/\\"/g, '"'));
    }
    return map;
  }
  const e = parseRecord("en");
  const z = parseRecord("zh");
  if (e.size === 0 || e.size !== z.size) {
    throw new Error(`dictionary.ts parse mismatch: en=${e.size} zh=${z.size}`);
  }
  let out = "# 介面文字 · UI Chrome Strings\n\n";
  out +=
    "> 對應來源：`lib/dictionary.ts`（Nav／Footer／按鈕／頁面標題等介面文字，非本人簡介或履歷內容）\n\n---\n\n";
  out += [...e.keys()].map((k) => F(`dictionary.${k}`, e.get(k), z.get(k))).join("\n");
  out += "\n";
  return out;
}

/* ── 05 專案介紹頁/<slug>.md ─────────────────────────────────────────── */

function file05(slug) {
  const enBody = fs.readFileSync(path.join(REPO, `_projects/${slug}.md`), "utf8");
  const zhBody = fs.readFileSync(path.join(REPO, `_projects/${slug}.zh.md`), "utf8");
  let out = `# ${slug}\n\n`;
  out += `> 對應來源：\`_projects/${slug}.md\`（英文全文，含 frontmatter）與 \`_projects/${slug}.zh.md\`（中文全文）\n`;
  out += "> 這兩份檔案本身就是 Markdown，這裡直接原樣放兩份內容，改完直接整段覆寫回對應檔案即可。\n\n---\n\n";
  out += `## EN — \`_projects/${slug}.md\`\n\n`;
  out += "```markdown\n" + norm(enBody) + "```\n\n---\n\n";
  out += `## 中文 — \`_projects/${slug}.zh.md\`\n\n`;
  out += "```markdown\n" + norm(zhBody) + "```\n";
  return out;
}

/* ── Write ───────────────────────────────────────────────────────────── */

const writes = [
  ["01-首頁與關於.md", file01()],
  ["02-作品卡片.md", file02()],
  ["03-履歷.md", file03()],
  ["04-介面文字.md", file04()],
];
for (const p of en.projects) {
  writes.push([path.join("05-專案介紹頁", `${p.slug}.md`), file05(p.slug)]);
}

if (!fs.existsSync(OUT)) {
  throw new Error(
    `Output folder not found:\n  ${OUT}\nPass the vault folder as an argument or set OBSIDIAN_COPY_DIR.`,
  );
}
fs.mkdirSync(path.join(OUT, "05-專案介紹頁"), { recursive: true });
for (const [rel, content] of writes) {
  fs.writeFileSync(path.join(OUT, rel), content);
  console.log("wrote", rel);
}
console.log(`\n${writes.length} files written to ${OUT}`);
