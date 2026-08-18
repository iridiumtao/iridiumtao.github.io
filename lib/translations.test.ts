// lib/translations.test.ts
// CN-01..CN-08 / LOC-02 / LOC-05 content-integrity guard for both locales.
//
// What this guards that `satisfies PortfolioData` cannot: `satisfies` proves
// data/portfolio.zh.json is structurally COMPLETE. It cannot see that a value
// is still the English string, that an optional prose key was quietly omitted,
// that a resume bullet was dropped, that a Simplified character slipped in, or
// that _projects/<slug>.zh.md does not exist on disk. Every one of those leaves
// the build green and the site looking finished while being wrong for the only
// readership the Chinese locale exists for. Each assertion below closes one of
// those holes and names the offending JSON path or file in its message.
//
// Node 26 invocation notes (see lib/blogRedirects.test.ts for precedent):
// - Run with bare `yarn test` / `node --test` -- NEVER `node --test <dir>`
//   (repo gotcha, treats the path as a script to require).
// - Relative imports must use the exact on-disk extension, and JSON imports
//   need the `with { type: "json" }` attribute, for Node's native ESM loader.
// - This file is ESM: `__dirname` is unavailable, use `import.meta.dirname`.
//
// Reading the raw JSON here is deliberate and does NOT violate CLAUDE.md's
// accessor rule: that rule governs pages and components, whose job is to render
// content. This test's job is to compare the two files against each other, so
// it must see them unmerged and unabstracted.
//
// scripts/subset-font.ts excludes *.test.ts from its lib/ scan, so the
// Simplified characters listed below never reach the font subset.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import enData from "../data/portfolio.json" with { type: "json" };
import zhData from "../data/portfolio.zh.json" with { type: "json" };
import type { PortfolioData } from "../types/portfolio";

// The annotation IS the structural check -- if either file drifts from
// PortfolioData, `yarn typecheck` fails here. data/portfolio.zh.json has no
// other typed consumer until plan 06-05 wires getPortfolioData("zh"), so this
// is currently the only place its shape is proven.
const en: PortfolioData = enData;
const zh: PortfolioData = zhData;

const PROJECTS_DIR = path.join(import.meta.dirname, "..", "_projects");
const EXPECTED_PROJECT_COUNT = 8;

/* ── Shared constants (re-used by plan 06-04's lib/dictionary.test.ts) ──── */

// Simplified-only characters. Every entry was checked to be absent from
// Traditional Chinese orthography, so a hit is always a real defect and never
// a false positive: deliberately EXCLUDED are characters that exist in both
// scripts (台, 里, 后, 面, 干, 几, 云, 志, 系, 表, 制, 注, 才, 叠, 届, 异, 担,
// 范, 温, 悦, 删, 册, 够, 余, 术) -- adding any of those would fail on correct
// Traditional prose. Seeded from research/PITFALLS.md Pitfall 8's table and
// extended with the high-frequency Simplified forms most likely to arrive with
// a pasted paragraph.
export const SIMPLIFIED_BLOCKLIST =
  // Pitfall 8's vocabulary table, character by character.
  "软项简历数据库务码内盘标网络联员计户栈" +
  // High-frequency Simplified forms, so a pasted mainland paragraph is caught
  // even when it uses none of the words in the table above.
  "发实现类学语训试验设图构结统单复处优讯资个们来时过这样东车马门问题经线级练终给" +
  "纪约纽织维续认识读课调论议让记详话请谢输转载辑边连运远进达选适错键锁镜长间际随" +
  "难风飞点热爱无为乐习书会传价众儿兴军农决况减击创则办动势医华协卫厂压参双变号叶" +
  "响园围团场块坚执声头夺奋奖妇孙宁宝审写宽宾寻对导将尔层属岛币师带帮广庆废弃张归" +
  "当录彻忆态怀总恶惊惯战扩扫护报拟换摄摆败敌断旧显机杀杂权条杨枪档桥检楼欢欧气汇" +
  "汉汤沟洁济浅测浏润渐满滚滤灭灯灵独献环电疗监盖础硕确离种积称稳竞笔签红纯纳纸组" +
  "细绘绝继绩综绿缓编缩罗义职胜脑脱艺节苏荐药获营蓝虑虽补装览观规觉触订讨讲许访证" +
  "评诉词译诗询误谈贝负责货质贴费赖赛赞趋轨轮轻较辅迁还违迟逻递遗邮释针钟铁链销闭" +
  "闲闻阅队阶阴阳陈险隐静页须顾预领频颜驱鱼鸟齐龙";

// Mainland vocabulary written in Traditional characters -- invisible to the
// character blocklist above, and the more likely failure mode when an AI drafts
// Chinese from English-trained instincts. Same source (Pitfall 8).
export const MAINLAND_TERM_BLOCKLIST: readonly string[] = [
  "軟件",
  "硬件",
  "信息",
  "界面",
  "數據庫",
  "服務器",
  "程序員",
  "代碼",
  "函數",
  "內存",
  "硬盤",
  "鼠標",
  "打印機",
  "網絡",
  "互聯網",
  "雲計算",
  "全棧",
  "人工智能",
  "項目",
  "簡歷",
  "視頻",
  "缺省",
  "默認",
  "屏幕",
  "激活",
  "移動端",
  "高清",
  "算法",
];

// Correct Taiwan compounds that CONTAIN a blocked term as a substring. Masked
// out before the search runs, so 演算法 (the correct Taiwan word for
// "algorithm") does not trip the 算法 entry above.
const TAIWAN_COMPOUNDS_TO_MASK: readonly string[] = ["演算法"];

// Proper nouns that must survive the translation pass verbatim, per
// research/FEATURES.md's leave-in-English glossary: technology, company,
// university and award names. Taiwanese technical writing code-switches these
// freely; inventing a Chinese equivalent makes the owner's record
// unverifiable and is itself a non-native tell. Matching is case-sensitive
// exact substring, so "PyTorch" does not match a lowercased spelling.
export const LEAVE_IN_ENGLISH: readonly string[] = [
  // Languages, frameworks, and tools
  "Python",
  "Go",
  "Java",
  "Swift",
  "JavaScript",
  "SQL",
  "Docker",
  "AWS",
  "Terraform",
  "GitHub Actions",
  "Airflow",
  "Prometheus",
  "Grafana",
  "Linux",
  "GitFlow",
  "FastAPI",
  "Flask",
  "Django",
  "Node.js",
  "React",
  "Vue",
  "RESTful",
  "WebSocket",
  "PostgreSQL",
  "PyTorch",
  "MLflow",
  "LlamaIndex",
  "LangChain",
  "LightGBM",
  "SHAP",
  "Streamlit",
  "SwiftUI",
  "SwiftData",
  "Swift Testing",
  "Xcode Cloud",
  "RealityKit",
  "Reality Composer Pro",
  "Realm",
  "MapKit",
  "Storyboards",
  "Channels",
  "Travis CI",
  "Elastic Beanstalk",
  "Chameleon Cloud",
  "MobileNetV2",
  "Food11",
  "Whisper",
  "TTS",
  "LoRA",
  "Gradio",
  "MinIO",
  "ScatNet",
  "Morlet",
  "MFCC",
  "SVM",
  "Prompt Engineering",
  "MLOps",
  "RISC-V",
  "MVVM",
  "MVC",
  "CI/CD",
  "IaC",
  "TDD",
  "QA",
  "RAG",
  "API",
  "IPC",
  "CPI",
  "ViewModel",
  // Companies and organizations
  "Micron",
  "CARITY AI",
  "MoBagel",
  "Mindtronic AI",
  "A Day",
  "ShowCode",
  "Google",
  "GitHub",
  "Telegram",
  "Gennadiy Civil",
  // Universities
  "NYU",
  "NTCUST",
  // Awards and events
  "OpenHCI'25",
  "TAICHI",
  "Fi-Award",
  "Level-Up Society Hackathon",
  "International Conference on Frontier Computing",
  "Better Retail",
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

type Pair = { path: string; en: string; zh: string };

// Prose paths whose English value is a bare proper noun with no natural
// Chinese counterpart. These are exempt from the divergence assertion and
// asserted byte-identical instead, so they cannot silently drift either.
// Enumerated by exact path with a reason, never by pattern -- a future
// untranslated field cannot slip in behind a wildcard.
const PROPER_NOUN_IDENTICAL: Record<string, string> = {
  "socials[0].title": "Github -- platform brand name",
  "socials[1].title": "LinkedIn -- platform brand name",
  "home.stack": "a list of technology names only, all leave-in-English",
  "projects[0].title": "Oblivilight - OpenHCI'25 -- project + event name",
  "projects[2].title": "Loud Plants in Your Area -- the project's own name",
  "projects[4].title": "RISC-V-Simulator -- repository name",
  "projects[5].title": "Retailpia -- the project's own name",
  "resume.education[0].relevantCoursework[3]": "MLOps -- leave-in-English term",
  "resume.projects[0].title": "NYU Marketplace -- the project's own name",
  "resume.projects[1].organization": "OpenHCI'25 -- event brand name",
  "resume.projects[4].title": "RISC-V-Simulator -- repository name",
  "resume.projects[8].title": "Retailpia -- the project's own name",
  "resume.projects[8].organization": "Level-Up Society Hackathon -- event name",
  "resume.honors[3].event": "Level-Up Society Hackathon -- event name",
  "resume.honors[3].organizer": "ShowCode -- company name",
};

// The optional prose keys types/portfolio.ts declares. `satisfies
// PortfolioData` accepts a file that simply omits any of them, and a
// divergence walk over a key absent on both sides compares nothing -- so
// presence parity is the only mechanism that catches a dropped optional
// translation. Re-read types/portfolio.ts if this list looks stale.
const OPTIONAL_PROSE_KEYS = {
  projects: ["subtitle"],
  honors: ["event", "organization", "organizer"],
} as const;

function has(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

// Builds the literal enumeration of translatable string fields. Deliberately
// hand-written rather than a generic tree walk: a generic walk would silently
// absorb any key a future content edit adds, which is exactly the drift this
// file exists to catch.
function collectProsePairs(): Pair[] {
  const pairs: Pair[] = [];
  const push = (p: string, a: string | undefined, b: string | undefined) => {
    if (a === undefined && b === undefined) return; // optional key absent in both
    pairs.push({ path: p, en: a ?? "", zh: b ?? "" });
  };

  push("aboutpara", en.aboutpara, zh.aboutpara);

  push("home.greeting", en.home.greeting, zh.home.greeting);
  push("home.availability", en.home.availability, zh.home.availability);
  en.home.heroLines.forEach((line, i) => {
    push(`home.heroLines[${i}]`, line, zh.home.heroLines[i]);
  });
  push("home.lede", en.home.lede, zh.home.lede);
  push("home.based", en.home.based, zh.home.based);
  push("home.degree", en.home.degree, zh.home.degree);
  push("home.stack", en.home.stack, zh.home.stack);
  push("home.honorsShort", en.home.honorsShort, zh.home.honorsShort);
  push("home.aboutPull", en.home.aboutPull, zh.home.aboutPull);

  en.socials.forEach((s, i) => {
    push(`socials[${i}].title`, s.title, zh.socials[i]?.title);
  });

  en.projects.forEach((p, i) => {
    const q = zh.projects[i];
    push(`projects[${i}].title`, p.title, q?.title);
    push(`projects[${i}].subtitle`, p.subtitle, q?.subtitle);
    push(`projects[${i}].description`, p.description, q?.description);
  });

  en.experiences.forEach((e, i) => {
    const f = zh.experiences[i];
    push(`experiences[${i}].title`, e.title, f?.title);
    push(`experiences[${i}].description`, e.description, f?.description);
  });

  push("resume.tagline", en.resume.tagline, zh.resume.tagline);
  push("resume.description", en.resume.description, zh.resume.description);

  en.resume.experiences.forEach((e, i) => {
    const f = zh.resume.experiences[i];
    push(`resume.experiences[${i}].position`, e.position, f?.position);
    push(`resume.experiences[${i}].type`, e.type, f?.type);
    push(`resume.experiences[${i}].location`, e.location, f?.location);
    e.bullets.forEach((b, j) => {
      push(`resume.experiences[${i}].bullets[${j}]`, b, f?.bullets[j]);
    });
  });

  en.resume.education.forEach((e, i) => {
    const f = zh.resume.education[i];
    push(`resume.education[${i}].degree`, e.degree, f?.degree);
    push(`resume.education[${i}].location`, e.location, f?.location);
    e.relevantCoursework.forEach((c, j) => {
      push(
        `resume.education[${i}].relevantCoursework[${j}]`,
        c,
        f?.relevantCoursework[j],
      );
    });
  });

  en.resume.projects.forEach((p, i) => {
    const q = zh.resume.projects[i];
    push(`resume.projects[${i}].title`, p.title, q?.title);
    push(`resume.projects[${i}].organization`, p.organization, q?.organization);
    push(`resume.projects[${i}].location`, p.location, q?.location);
    p.details.forEach((d, j) => {
      push(`resume.projects[${i}].details[${j}]`, d, q?.details[j]);
    });
  });

  en.resume.honors.forEach((h, i) => {
    const g = zh.resume.honors[i];
    push(`resume.honors[${i}].title`, h.title, g?.title);
    push(`resume.honors[${i}].event`, h.event, g?.event);
    push(`resume.honors[${i}].organization`, h.organization, g?.organization);
    push(`resume.honors[${i}].organizer`, h.organizer, g?.organizer);
    push(`resume.honors[${i}].location`, h.location, g?.location);
  });

  return pairs;
}

function zhMarkdownPath(slug: string): string {
  return path.join(PROJECTS_DIR, `${slug}.zh.md`);
}

function enMarkdownPath(slug: string): string {
  return path.join(PROJECTS_DIR, `${slug}.md`);
}

// Every Chinese content surface, as { label, text } for the character and term
// scans below.
function chineseContentFiles(): { label: string; text: string }[] {
  const files = [
    {
      label: "data/portfolio.zh.json",
      text: fs.readFileSync(
        path.join(import.meta.dirname, "..", "data", "portfolio.zh.json"),
        "utf8",
      ),
    },
  ];
  for (const p of en.projects) {
    const file = zhMarkdownPath(p.slug);
    if (fs.existsSync(file)) {
      files.push({
        label: `_projects/${p.slug}.zh.md`,
        text: fs.readFileSync(file, "utf8"),
      });
    }
  }
  return files;
}

/* ── 1. Prose divergence (CN-01, CN-02) ───────────────────────────────── */

test("every translatable prose field differs between locales (CN-01, CN-02)", () => {
  const pairs = collectProsePairs();
  assert.ok(pairs.length > 0, "the prose allowlist must not be empty");

  const untranslated: string[] = [];
  for (const { path: p, en: a, zh: b } of pairs) {
    if (p in PROPER_NOUN_IDENTICAL) continue; // asserted equal in the next test
    if (a.trim() === "") {
      // Nothing to translate. Assert the Chinese side is empty too, so this
      // carve-out cannot become a hiding place for junk.
      assert.equal(
        b.trim(),
        "",
        `${p}: English is empty, so Chinese must be empty too, got "${b}"`,
      );
      continue;
    }
    if (a === b) untranslated.push(p);
  }

  assert.deepEqual(
    untranslated,
    [],
    `these fields still hold the English string in data/portfolio.zh.json:\n  ` +
      `${untranslated.join("\n  ")}\n` +
      "Translate them, or (only for a bare proper noun) add the path to " +
      "PROPER_NOUN_IDENTICAL with a reason.",
  );
});

test("proper-noun-exempt prose fields are byte-identical between locales", () => {
  const byPath = new Map(collectProsePairs().map((p) => [p.path, p]));
  for (const [p, reason] of Object.entries(PROPER_NOUN_IDENTICAL)) {
    const pair = byPath.get(p);
    assert.ok(
      pair,
      `${p} is listed in PROPER_NOUN_IDENTICAL but is not a real prose path — ` +
        "the content moved and this exemption is now dead.",
    );
    assert.equal(
      pair.zh,
      pair.en,
      `${p} (${reason}) must stay byte-identical across locales`,
    );
  }
});

/* ── 1b. Optional-prose presence parity (LOC-02, LOC-05) ──────────────── */

test("optional prose keys are present in zh if and only if present in en (LOC-02, LOC-05)", () => {
  const mismatches: string[] = [];

  const compare = (
    label: string,
    keys: readonly string[],
    a: object,
    b: object | undefined,
  ) => {
    assert.ok(b, `${label}: no counterpart entry in data/portfolio.zh.json`);
    for (const key of keys) {
      const inEn = has(a, key);
      const inZh = has(b, key);
      if (inEn && !inZh) mismatches.push(`${label}.${key} — missing in zh`);
      if (!inEn && inZh) mismatches.push(`${label}.${key} — extra in zh`);
    }
  };

  en.projects.forEach((p, i) => {
    compare(`projects[${i}]`, OPTIONAL_PROSE_KEYS.projects, p, zh.projects[i]);
  });
  en.resume.honors.forEach((h, i) => {
    compare(
      `resume.honors[${i}]`,
      OPTIONAL_PROSE_KEYS.honors,
      h,
      zh.resume.honors[i],
    );
  });

  assert.deepEqual(
    mismatches,
    [],
    `optional prose key presence differs between locales:\n  ${mismatches.join("\n  ")}`,
  );
});

/* ── 2. Identifier, date, and factual parity (CN-07) ──────────────────── */

test("identifier, date, and factual fields are strictly equal between locales (CN-07)", () => {
  const diffs: string[] = [];
  const same = (p: string, a: unknown, b: unknown) => {
    const x = JSON.stringify(a);
    const y = JSON.stringify(b);
    if (x !== y) diffs.push(`${p}: en=${x} zh=${y}`);
  };

  same("home.contactEmail", en.home.contactEmail, zh.home.contactEmail);
  same("home.projectCount", en.home.projectCount, zh.home.projectCount);
  same("showCursor", en.showCursor, zh.showCursor);
  same("darkMode", en.darkMode, zh.darkMode);
  same("showResume", en.showResume, zh.showResume);

  en.socials.forEach((s, i) => {
    same(`socials[${i}].link`, s.link, zh.socials[i]?.link);
  });

  en.projects.forEach((p, i) => {
    const q = zh.projects[i];
    for (const k of [
      "id",
      "slug",
      "imageSrc",
      "url",
      "demoUrl",
      "techStack",
      // Dates are parser inputs and sort keys, not copy. lib/projects.ts's
      // ts(), pages/resume.page.tsx's getSortableDate() and
      // pages/index.page.tsx's formatExpDate() all parse them by ENGLISH month
      // name and degrade silently rather than failing the build, so this
      // assertion is the only thing standing between a translated date and a
      // silently mis-ordered grid.
      "startDate",
      "endDate",
    ] as const) {
      same(`projects[${i}].${k}`, p[k], q?.[k]);
    }
  });

  en.experiences.forEach((e, i) => {
    same(`experiences[${i}].id`, e.id, zh.experiences[i]?.id);
  });

  en.resume.experiences.forEach((e, i) => {
    same(`resume.experiences[${i}].id`, e.id, zh.resume.experiences[i]?.id);
    same(
      `resume.experiences[${i}].dates`,
      e.dates,
      zh.resume.experiences[i]?.dates,
    );
  });

  en.resume.education.forEach((e, i) => {
    const f = zh.resume.education[i];
    same(`resume.education[${i}].id`, e.id, f?.id);
    same(
      `resume.education[${i}].universityDate`,
      e.universityDate,
      f?.universityDate,
    );
    same(`resume.education[${i}].gpa`, e.gpa, f?.gpa);
  });

  en.resume.projects.forEach((p, i) => {
    same(`resume.projects[${i}].id`, p.id, zh.resume.projects[i]?.id);
    same(`resume.projects[${i}].dates`, p.dates, zh.resume.projects[i]?.dates);
  });

  en.resume.honors.forEach((h, i) => {
    same(`resume.honors[${i}].id`, h.id, zh.resume.honors[i]?.id);
    same(`resume.honors[${i}].year`, h.year, zh.resume.honors[i]?.year);
  });

  for (const bucket of [
    "languages",
    "cloudAndDevOps",
    "frameworksAndBackend",
    "dataAndML",
  ] as const) {
    same(
      `resume.skills.${bucket}`,
      en.resume.skills[bucket],
      zh.resume.skills[bucket],
    );
  }

  assert.deepEqual(
    diffs,
    [],
    `these identifier/date/factual fields differ between locales — the Chinese ` +
      `content must state no claim the English does not:\n  ${diffs.join("\n  ")}`,
  );
});

/* ── 3. Null-field parity (CN-08) ─────────────────────────────────────── */

test("role/problem/process/outcome are null in BOTH locales for all 8 projects (CN-08)", () => {
  const bad: string[] = [];
  for (const [label, doc] of [
    ["en", en],
    ["zh", zh],
  ] as const) {
    doc.projects.forEach((p) => {
      for (const k of ["role", "problem", "process", "outcome"] as const) {
        if (p[k] !== null) bad.push(`${label}: projects[${p.slug}].${k}`);
      }
    });
  }
  assert.deepEqual(
    bad,
    [],
    `the owner writes this prose himself — it must stay null:\n  ${bad.join("\n  ")}`,
  );
});

/* ── 4. Markdown sibling existence (LOC-05) ───────────────────────────── */

test("every project has a _projects/<slug>.zh.md sibling (LOC-05)", () => {
  const missing = en.projects
    .map((p) => p.slug)
    .filter((slug) => !fs.existsSync(zhMarkdownPath(slug)));

  assert.deepEqual(
    missing,
    [],
    "missing Chinese showcase bodies:\n  " +
      missing.map((s) => `_projects/${s}.zh.md`).join("\n  ") +
      "\nWrite each one as a translation of its _projects/<slug>.md sibling. " +
      "TypeScript cannot see a filesystem fact, so this test is the only thing " +
      "that catches it before a build is attempted.",
  );
});

/* ── 5. Markdown non-emptiness and divergence (CN-03) ─────────────────── */

test("every .zh.md body is non-empty and differs from its English sibling (CN-03)", () => {
  const problems: string[] = [];
  for (const { slug } of en.projects) {
    const zhFile = zhMarkdownPath(slug);
    const enFile = enMarkdownPath(slug);
    if (!fs.existsSync(zhFile)) continue; // reported by the previous test

    const zhText = fs.readFileSync(zhFile, "utf8");
    if (zhText.trim() === "") {
      problems.push(
        `_projects/${slug}.zh.md is empty — it would render a blank showcase page`,
      );
      continue;
    }
    if (fs.existsSync(enFile)) {
      const enText = fs.readFileSync(enFile, "utf8");
      if (zhText === enText) {
        problems.push(
          `_projects/${slug}.zh.md is byte-identical to its English sibling`,
        );
      }
    }
  }
  assert.deepEqual(problems, [], problems.join("\n  "));
});

/* ── 6. Simplified-character blocklist (CN-05) ────────────────────────── */

test("no Simplified character appears in any Chinese content file (CN-05)", () => {
  // Asserted non-empty so an emptied or mistyped list fails loudly rather than
  // passing vacuously.
  assert.ok(
    SIMPLIFIED_BLOCKLIST.length > 0,
    "SIMPLIFIED_BLOCKLIST must not be empty",
  );

  // Iterating with for...of yields whole code points, so a surrogate pair is
  // compared as one character rather than two UTF-16 units.
  const blocked = new Set<string>();
  for (const ch of SIMPLIFIED_BLOCKLIST) blocked.add(ch);

  const hits: string[] = [];
  for (const { label, text } of chineseContentFiles()) {
    for (const ch of text) {
      if (!blocked.has(ch)) continue;
      const cp = ch.codePointAt(0) as number;
      const hit = `${label}: "${ch}" (U+${cp.toString(16).toUpperCase().padStart(4, "0")})`;
      if (!hits.includes(hit)) hits.push(hit);
    }
  }

  assert.deepEqual(
    hits,
    [],
    `Simplified characters found — this content must be Taiwan Traditional ` +
      `Chinese:\n  ${hits.join("\n  ")}`,
  );
});

test("no mainland-vocabulary term appears in any Chinese content file (CN-05)", () => {
  assert.ok(
    MAINLAND_TERM_BLOCKLIST.length > 0,
    "MAINLAND_TERM_BLOCKLIST must not be empty",
  );

  const hits: string[] = [];
  for (const { label, text } of chineseContentFiles()) {
    // Mask the correct Taiwan compounds first, character-for-character, so
    // offsets are preserved and only the substring is neutralized.
    let scannable = text;
    for (const compound of TAIWAN_COMPOUNDS_TO_MASK) {
      scannable = scannable.split(compound).join(" ".repeat(compound.length));
    }
    for (const term of MAINLAND_TERM_BLOCKLIST) {
      if (scannable.includes(term)) {
        hits.push(`${label}: "${term}"`);
      }
    }
  }

  assert.deepEqual(
    hits,
    [],
    `mainland-Chinese vocabulary found (written in Traditional characters, so ` +
      `the character blocklist cannot see it):\n  ${hits.join("\n  ")}\n` +
      "See research/PITFALLS.md Pitfall 8 for the Taiwan replacement.",
  );
});

/* ── 7. Leave-in-English glossary (CN-06) ─────────────────────────────── */

test("every leave-in-English glossary token survives the translation pass (CN-06)", (t) => {
  assert.ok(LEAVE_IN_ENGLISH.length > 0, "LEAVE_IN_ENGLISH must not be empty");

  const read = (file: string) =>
    fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

  const enText = [
    read(path.join(import.meta.dirname, "..", "data", "portfolio.json")),
    ...en.projects.map((p) => read(enMarkdownPath(p.slug))),
  ].join("\n");
  const zhText = [
    read(path.join(import.meta.dirname, "..", "data", "portfolio.zh.json")),
    ...en.projects.map((p) => read(zhMarkdownPath(p.slug))),
  ].join("\n");

  const lost: string[] = [];
  const skipped: string[] = [];
  for (const token of LEAVE_IN_ENGLISH) {
    // Case-sensitive exact substring on the raw file text.
    if (!enText.includes(token)) {
      skipped.push(token);
      continue;
    }
    if (!zhText.includes(token)) lost.push(token);
  }

  if (skipped.length > 0) {
    t.diagnostic(
      `skipped ${skipped.length} glossary token(s) absent from the English ` +
        `source (not counted as passing): ${skipped.join(", ")}`,
    );
  }

  assert.deepEqual(
    lost,
    [],
    `these proper nouns were translated away — they must stay in English so ` +
      `the owner's record stays verifiable:\n  ${lost.join("\n  ")}`,
  );
});

/* ── 8. Slug-set equality ─────────────────────────────────────────────── */

test("both locales carry the same 8 project slugs, in the same order", () => {
  const enSlugs = en.projects.map((p) => p.slug);
  const zhSlugs = zh.projects.map((p) => p.slug);
  assert.equal(enSlugs.length, EXPECTED_PROJECT_COUNT);
  assert.equal(zhSlugs.length, EXPECTED_PROJECT_COUNT);
  assert.deepEqual(
    zhSlugs,
    enSlugs,
    "slug order drives the showcase grid order",
  );
});

/* ── 9. Array length parity (CN-02, CN-07) ────────────────────────────── */

test("every content array is the same length in both locales (CN-02, CN-07)", () => {
  const diffs: string[] = [];
  const sameLength = (
    p: string,
    a: readonly unknown[],
    b: readonly unknown[] | undefined,
  ) => {
    if (!b) {
      diffs.push(`${p}: absent in zh (en has ${a.length})`);
      return;
    }
    if (a.length !== b.length) {
      diffs.push(`${p}: en=${a.length} zh=${b.length}`);
    }
  };

  // Compared against the English file rather than hardcoded counts, so this
  // survives the owner adding a job or an honor later. A dropped honor or
  // resume bullet typechecks cleanly and is a factual OMISSION about a real
  // person's record, not a formatting slip.
  sameLength("socials", en.socials, zh.socials);
  sameLength("experiences", en.experiences, zh.experiences);
  sameLength("projects", en.projects, zh.projects);
  sameLength("home.heroLines", en.home.heroLines, zh.home.heroLines);
  sameLength(
    "resume.experiences",
    en.resume.experiences,
    zh.resume.experiences,
  );
  sameLength("resume.education", en.resume.education, zh.resume.education);
  sameLength("resume.projects", en.resume.projects, zh.resume.projects);
  sameLength("resume.honors", en.resume.honors, zh.resume.honors);

  for (const bucket of [
    "languages",
    "cloudAndDevOps",
    "frameworksAndBackend",
    "dataAndML",
  ] as const) {
    sameLength(
      `resume.skills.${bucket}`,
      en.resume.skills[bucket],
      zh.resume.skills[bucket],
    );
  }

  en.resume.experiences.forEach((e, i) => {
    sameLength(
      `resume.experiences[${i}].bullets`,
      e.bullets,
      zh.resume.experiences[i]?.bullets,
    );
  });
  en.resume.education.forEach((e, i) => {
    sameLength(
      `resume.education[${i}].relevantCoursework`,
      e.relevantCoursework,
      zh.resume.education[i]?.relevantCoursework,
    );
  });
  en.resume.projects.forEach((p, i) => {
    sameLength(
      `resume.projects[${i}].details`,
      p.details,
      zh.resume.projects[i]?.details,
    );
  });

  assert.deepEqual(
    diffs,
    [],
    `array lengths differ between locales:\n  ${diffs.join("\n  ")}`,
  );
});
