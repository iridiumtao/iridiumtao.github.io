// scripts/prepare-resumes.ts
// Selects the newest-versioned résumé PDF per "purpose" from docs/ and copies
// each into public/resumes/resume-<purpose>.pdf. Runs on every predev/prebuild.
// Deliberately CommonJS (require/__dirname, no import/export): Node executes
// this file directly via the lifecycle hooks and strips the type annotations
// at runtime, and adding any top-level import/export would flip it to ESM and
// break `require`. tsconfig's moduleDetection: "force" keeps `tsc` from
// treating this and subset-font.ts as one shared global scope.
// `require` returns `any`, so the annotations below are what give every fs/path
// call site real types. `typeof import(...)` is a type-position-only construct:
// it is erased entirely at runtime and does NOT turn this file into an ESM
// module, so `require` keeps working.
const fs: typeof import("fs") = require("fs");
const path: typeof import("path") = require("path");

// One résumé PDF discovered in docs/, after filename parsing.
type ResumeEntry = {
  filename: string;
  year: number;
  rank: number;
  version: string;
  purpose: string;
};

const docsDir = path.join(__dirname, "../docs");
const publicResumesDir = path.join(__dirname, "../public/resumes");


// Within-year ordering of the filename's season prefix. Rank 1 is deliberately
// absent from this table: a bare "2025" (no prefix) is assigned rank 1 below,
// so it sorts after "pre 2025" and before "early 2025".
const yearInfoOrder: Record<string, number> = {
  pre: 0,
  early: 2,
  mid: 3,
  late: 4,
};

function parseYearInfo(yearInfoStr: string): { year: number; rank: number } {
  const parts = yearInfoStr.split(" ");
  let year: number, rank: number;
  if (parts.length === 1 && !isNaN(Number(parts[0]))) {
    year = parseInt(parts[0], 10);
    rank = 1;
  } else {
    year = parseInt(parts[1], 10);
    // noUncheckedIndexedAccess is off, so this lookup is typed `number` while
    // an unknown prefix yields undefined at runtime -- that NaN would poison
    // the sort comparator below and make "latest résumé" arbitrary.
    rank = yearInfoOrder[parts[0]] ?? 0;
  }
  return { year, rank };
}

function compareVersions(v1: string, v2: string): number {
  if (!v1) return -1;
  if (!v2) return 1;
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

// Read and parse docs/ BEFORE touching public/resumes/. The destination wipe
// used to run first, so a missing or unreadable docs/ left the directory empty
// and crashed prebuild -- and because pages/resume.page.tsx swallows the empty
// read, the next build would quietly ship a résumé page with no downloads.
if (!fs.existsSync(docsDir)) {
  console.error(`prepare-resumes: ${docsDir} not found`);
  process.exit(1);
}

const files = fs.readdirSync(docsDir);
const pdfs = files.filter((file) => file.endsWith(".pdf"));

const resumes: Record<string, ResumeEntry[]> = {};

const filenameRegex = /^Chun-Ju Tao Resume (.*)\.pdf$/;

for (const pdf of pdfs) {
  const match = pdf.match(filenameRegex);
  if (!match) continue;

  let details = match[1];
  let version = "0";

  const versionMatch = details.match(/ v([\d\.]+)$/);
  if (versionMatch) {
    version = versionMatch[1];
    details = details.replace(versionMatch[0], "");
  }

  const yearRegex = /(late \d{4}|mid \d{4}|early \d{4}|\d{4}|pre \d{4})/;
  const yearMatch = details.match(yearRegex);
  if (!yearMatch) continue;

  const yearInfo = yearMatch[0];
  const { year, rank } = parseYearInfo(yearInfo);

  let purpose = details.replace(yearInfo, "").trim();
  if (purpose === "") {
    purpose = "SWE";
  }

  const resumeData: ResumeEntry = { filename: pdf, year, rank, version, purpose };

  if (!resumes[purpose]) {
    resumes[purpose] = [];
  }
  resumes[purpose].push(resumeData);
}

// Only now is it safe to clear the destination: at least one purpose resolved,
// so the copy loop below will repopulate it.
const purposes = Object.keys(resumes);
if (purposes.length === 0) {
  console.error(
    `prepare-resumes: no résumé PDFs matched in ${docsDir} -- ` +
      `leaving public/resumes/ untouched.`,
  );
  process.exit(1);
}

if (!fs.existsSync(publicResumesDir)) {
  fs.mkdirSync(publicResumesDir, { recursive: true });
}

fs.readdirSync(publicResumesDir).forEach((f) => {
  try {
    fs.unlinkSync(path.join(publicResumesDir, f));
  } catch (e) {
    console.error(`Error removing file ${f}: ${e}`);
  }
});

for (const purpose in resumes) {
  resumes[purpose].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.rank !== b.rank) return b.rank - a.rank;
    return compareVersions(b.version, a.version);
  });

  const latest = resumes[purpose][0];
  if (latest) {
    const sourcePath = path.join(docsDir, latest.filename);
    const destPath = path.join(
      publicResumesDir,
      `resume-${purpose.toLowerCase()}.pdf`,
    );
    fs.copyFileSync(sourcePath, destPath);
    console.log(
      `Copied ${latest.filename} as resume-${purpose.toLowerCase()}.pdf`,
    );
  }
}
