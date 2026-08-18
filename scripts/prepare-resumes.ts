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
  // noUncheckedIndexedAccess types every array index as possibly-missing. The
  // two locals below restate what split() already guarantees rather than
  // changing behavior: split never returns a hole, so `prefix` is "" at worst,
  // and `tail` is genuinely absent only on a single-token input -- which is
  // exactly the branch that never reads it. Both fallbacks are therefore
  // unreachable, and each was chosen to match what the old code did at runtime
  // (Number("") and parseInt("") already produced 0 and NaN respectively).
  const prefix = parts[0] ?? "";
  const tail = parts[1] ?? "";
  let year: number, rank: number;
  if (parts.length === 1 && !isNaN(Number(prefix))) {
    year = parseInt(prefix, 10);
    rank = 1;
  } else {
    year = parseInt(tail, 10);
    // The lookup is now correctly typed as possibly-undefined, which is what an
    // unknown season prefix really produces. The `?? 0` is what keeps that miss
    // from becoming a NaN that would poison the sort comparator below and make
    // "latest résumé" arbitrary -- the whole point of this fallback.
    rank = yearInfoOrder[prefix] ?? 0;
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

  // `match[0]` is declared `string` by RegExpMatchArray, but capture groups come
  // through the array index signature and so read as possibly-missing under
  // noUncheckedIndexedAccess. Group 1 is non-optional in both patterns here --
  // a successful match always has it -- so these fallbacks are unreachable and
  // preserve the previous values exactly.
  let details = match[1] ?? "";
  let version = "0";

  const versionMatch = details.match(/ v([\d\.]+)$/);
  if (versionMatch) {
    version = versionMatch[1] ?? "0";
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

  // The `if (!resumes[p]) resumes[p] = []` idiom does NOT narrow the subsequent
  // re-index under noUncheckedIndexedAccess -- a Record lookup stays
  // possibly-undefined however many times it is guarded. Obtain the bucket once
  // as a definite local and push through that instead.
  const bucket = (resumes[purpose] ??= []);
  bucket.push(resumeData);
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
  // Same Record-narrowing limitation as the push site above: bind the array once
  // rather than re-indexing. `for...in` only ever yields keys that exist, so the
  // guard is unreachable -- it exists to give `entries` a definite type, not to
  // handle a real case. The comparator below is untouched: year descending, then
  // rank descending, then version descending. Reordering it would silently ship
  // the wrong résumé, and nothing downstream would fail loudly.
  const entries = resumes[purpose];
  if (!entries) continue;

  entries.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.rank !== b.rank) return b.rank - a.rank;
    return compareVersions(b.version, a.version);
  });

  const latest = entries[0];
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
