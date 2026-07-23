// lib/dictionary.ts
// Every UI chrome string on the site, in both locales (D-05: a plain typed
// accessor, no i18n library). "Chrome" means interface furniture — nav labels,
// section headings, button states, page-title templates. Anything that belongs
// to the owner's own record — his bio, résumé entries, project descriptions —
// stays in data/portfolio.json / data/portfolio.zh.json and is NOT restated
// here, so there is exactly one place to correct a claim about him.
//
// `satisfies Record<Locale, ChromeStrings>` is the whole enforcement mechanism,
// mirroring lib/portfolio.ts's compile-time-only posture: a key present in one
// locale and missing from the other fails `yarn typecheck`. There is
// deliberately NO `?? en` fallback anywhere in this file — a fallback turns a
// missing translation into an English string silently rendered on a Chinese
// page, which is the exact defect the type check exists to make impossible.
// What `satisfies` still cannot see — a value copy-pasted from the English
// record — is caught by lib/dictionary.test.ts instead.
//
// CHINESE REGISTER (D-11), the same one plan 06-03 fixed for the site's prose
// and recorded in 06-03-SUMMARY.md: first person, informal but professional —
// the voice of a Taiwanese engineer talking about his own work. 我 is the
// subject, the reader is 你 (never 您), no 敬語, no 之/其/乃. Taiwan usage only —
// 履歷、專案、資訊、軟體、介面、資料、演算法 — never their mainland counterparts;
// research/PITFALLS.md Pitfall 8 holds the full table, and lib/dictionary.test.ts
// enforces it, which is why the wrong forms are not even written out here.
// Technology, company, university and award names stay in English per
// research/FEATURES.md's glossary (CN-06).
// CJK/Latin spacing is authored into the copy («雲端與 DevOps»), because plan
// 06-02 deliberately omitted the CSS text-autospace gap on that assumption.
//
// NOT IN THIS FILE, on purpose:
// - The `01 ／` / `02 ／` section numerals and the `404` kicker are layout, not
//   copy. They render identically in both locales and stay literal in the page.
// - The dev-only `Edit Data` link stays English. It only renders through
//   pages/edit.dev.tsx, which next.config.js's `pageExtensions` excludes from
//   the production export, so no visitor in either locale can ever see it —
//   translating it would add a maintained string with no reader.
// - The résumé PDF download labels (`Software Engineer`, `ML Engineer`, …) are
//   derived from the public/resumes/*.pdf filenames and name English-language
//   documents; the Chinese résumé PDF is out of scope this milestone
//   (ZHPDF-01/02), so labelling those links in English is accurate, not a gap.
import type { Locale } from "./locale.ts";

/* ── Shape ────────────────────────────────────────────────────────────── */

/**
 * Flat and string-only by design: no nested objects, no functions. A count or
 * a name is carried by a `{…}` placeholder interpolated at the call site (see
 * `showAllTemplate`), which keeps every value a plain string so
 * lib/dictionary.test.ts can iterate the whole record uniformly and prove each
 * value is really translated.
 */
export type ChromeStrings = {
  // Shared chrome — Nav and Footer
  /** Rendered as `{data.name} {brandSuffix}` in the nav and footer wordmark. */
  brandSuffix: string;
  navProjects: string;
  navWork: string;
  navAbout: string;
  navContact: string;
  navResumeCta: string;
  navHomeCta: string;
  footerCopy: string;

  // Language switcher (D-06)
  /** Autonym of the locale currently being read. */
  localeSelfLabel: string;
  /** Autonym of the locale the switcher links to. */
  localeOtherLabel: string;
  localeSwitchAriaLabel: string;

  // Home page
  metaBased: string;
  metaDegree: string;
  metaStack: string;
  metaHonors: string;
  sectionProjects: string;
  sectionExperience: string;
  sectionAbout: string;
  /** `{n}` — the total number of projects. */
  showAllTemplate: string;
  showLess: string;

  // Résumé page
  resumeHeading: string;
  resumeSectionEducation: string;
  resumeSectionSkills: string;
  resumeSectionExperience: string;
  resumeSectionProjects: string;
  resumeSectionHonors: string;
  /** `{n}` — the number of professional roles listed. */
  resumeRolesCountTemplate: string;
  /** `{n}` — the number of résumé projects listed. */
  resumeProjectsCountTemplate: string;
  skillsLanguages: string;
  skillsCloudAndDevOps: string;
  skillsFrameworksAndBackend: string;
  skillsDataAndML: string;

  // Project showcase page
  projectRepositoryLink: string;
  projectLiveDemoLink: string;
  projectNavPrevLabel: string;
  projectNavNextLabel: string;

  // 404
  notFoundHeading: string;
  notFoundBody: string;
  notFoundBackLink: string;

  // <title> and meta-description templates. `{name}` is the composed wordmark.
  homeTitleTemplate: string;
  homeDescriptionTemplate: string;
  resumeTitleTemplate: string;
  resumeDescriptionTemplate: string;
  notFoundTitle: string;
  notFoundDescription: string;
};

/* ── The two records ──────────────────────────────────────────────────── */

export const DICTIONARY = {
  en: {
    brandSuffix: "Tao",
    navProjects: "Projects",
    navWork: "Work",
    navAbout: "About",
    navContact: "Contact",
    navResumeCta: "Resume →",
    navHomeCta: "← Home",
    footerCopy: "© 2026 · PIT + TPE",

    localeSelfLabel: "EN",
    localeOtherLabel: "中",
    localeSwitchAriaLabel: "Switch to Traditional Chinese",

    metaBased: "Based",
    metaDegree: "Degree",
    metaStack: "Stack",
    metaHonors: "Honors",
    sectionProjects: "Selected Projects",
    sectionExperience: "Professional Experience",
    sectionAbout: "About",
    showAllTemplate: "Show All ({n})",
    showLess: "Show Less",

    resumeHeading: "Résumé",
    resumeSectionEducation: "Education",
    resumeSectionSkills: "Technical Skills",
    resumeSectionExperience: "Professional Experience",
    resumeSectionProjects: "Projects",
    resumeSectionHonors: "Honors & Awards",
    resumeRolesCountTemplate: "{n} roles",
    resumeProjectsCountTemplate: "{n} selected",
    skillsLanguages: "Languages",
    skillsCloudAndDevOps: "Cloud & DevOps",
    skillsFrameworksAndBackend: "Frameworks & Backend",
    skillsDataAndML: "Data & ML",

    projectRepositoryLink: "Repository ↗",
    projectLiveDemoLink: "Live Demo ↗",
    projectNavPrevLabel: "Previous project",
    projectNavNextLabel: "Next project",

    notFoundHeading: "Page not found",
    notFoundBody: "The page you’re looking for doesn’t exist or has moved.",
    notFoundBackLink: "← Back to home",

    homeTitleTemplate: "{name} — Engineer",
    homeDescriptionTemplate:
      "{name} — engineer working on MLOps, backend systems and scalable cloud infrastructure. Selected projects, experience and résumé.",
    resumeTitleTemplate: "Resume — {name}",
    resumeDescriptionTemplate:
      "The full résumé of {name} — education, technical skills, professional experience, projects and awards.",
    notFoundTitle: "404 — Page Not Found",
    notFoundDescription: "This page doesn’t exist or has moved.",
  },
  zh: {
    // 歐東 is the Chinese name documented in CLAUDE.md and used throughout
    // data/portfolio.zh.json. His legal surname was NOT rendered into Hanzi —
    // guessing it would be fabrication (see 06-03-SUMMARY.md). The wordmark
    // therefore reads «Chun-Ju (Iridium) 歐東» on Chinese pages.
    brandSuffix: "歐東",
    navProjects: "專案",
    navWork: "經歷",
    navAbout: "關於",
    navContact: "聯絡",
    navResumeCta: "履歷 →",
    navHomeCta: "← 首頁",
    // PIT + TPE are airport codes; a Taiwanese reader reads the city names
    // faster than the IATA codes, and both cities are already named in
    // data/portfolio.zh.json.
    footerCopy: "© 2026 · 匹茲堡 + 台北",

    localeSelfLabel: "中",
    localeOtherLabel: "EN",
    localeSwitchAriaLabel: "切換至 English",

    metaBased: "所在地",
    metaDegree: "學歷",
    metaStack: "常用技術",
    metaHonors: "獲獎",
    sectionProjects: "精選專案",
    sectionExperience: "工作經歷",
    sectionAbout: "關於我",
    showAllTemplate: "看全部（{n}）",
    showLess: "收合",

    resumeHeading: "履歷",
    resumeSectionEducation: "學歷",
    resumeSectionSkills: "技術能力",
    resumeSectionExperience: "工作經歷",
    resumeSectionProjects: "專案",
    resumeSectionHonors: "榮譽與獲獎",
    resumeRolesCountTemplate: "共 {n} 份工作",
    resumeProjectsCountTemplate: "精選 {n} 件",
    skillsLanguages: "程式語言",
    skillsCloudAndDevOps: "雲端與 DevOps",
    skillsFrameworksAndBackend: "框架與後端",
    skillsDataAndML: "資料與機器學習",

    projectRepositoryLink: "原始碼 ↗",
    projectLiveDemoLink: "線上 Demo ↗",
    projectNavPrevLabel: "上一個專案",
    projectNavNextLabel: "下一個專案",

    notFoundHeading: "找不到這個頁面",
    notFoundBody: "你要找的頁面不存在，或是已經搬家了。",
    notFoundBackLink: "← 回首頁",

    homeTitleTemplate: "{name} — 工程師",
    homeDescriptionTemplate:
      "{name} — 做 MLOps、後端系統與雲端基礎設施的工程師。這裡有精選專案、工作經歷與履歷。",
    resumeTitleTemplate: "履歷 — {name}",
    resumeDescriptionTemplate:
      "{name} 的完整履歷：學歷、技術能力、工作經歷、專案與獲獎紀錄。",
    notFoundTitle: "404 — 找不到頁面",
    notFoundDescription: "這個頁面不存在，或是已經搬家了。",
  },
} satisfies Record<Locale, ChromeStrings>;

/* ── Accessor ─────────────────────────────────────────────────────────── */

/**
 * The chrome strings for one locale. `locale` is required on purpose: calling
 * `t()` with no argument is a type error rather than a silent default to
 * English, so a component that forgot to thread its locale through cannot ship
 * an English nav on a Chinese page.
 */
export function t(locale: Locale): ChromeStrings {
  return DICTIONARY[locale];
}
