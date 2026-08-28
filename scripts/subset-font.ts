// scripts/subset-font.ts
// Regenerates every self-hosted webfont under public/fonts/ on each
// predev/prebuild by scanning the site's actual rendered content (site-wide,
// not just the Wood pages) for distinct characters and re-subsetting the
// committed hermetic source fonts under assets/fonts/ with a pure Node/WASM
// subsetter (subset-font, backed by harfbuzzjs) -- no Python, no manual
// re-subsetting step. Mirrors scripts/prepare-resumes.ts's style: plain
// CommonJS, fs/path only, console.log progress lines.
//
// Three faces are emitted from one scan: the CJK display face (Open Huninn)
// and the two mono faces (Meslo LG M regular + bold, which replaced the
// Google-hosted JetBrains Mono). One shared character set is correct for all
// three -- harfbuzz simply drops any requested code point a given source font
// has no glyph for, so Meslo yields its Latin coverage and Open Huninn its
// CJK coverage without the scan needing to know which face renders what.
//
// Deliberately CommonJS (require/__dirname, no import/export): Node runs this
// file directly from the lifecycle hooks and strips its type annotations at
// runtime; a top-level import/export would flip it to ESM and break `require`.
// The `typeof import(...)` annotations are type-position only and fully erased.
const fs: typeof import("fs") = require("fs");
const path: typeof import("path") = require("path");

const rootDir = path.join(__dirname, "..");

// Every face this script emits, as (hermetic source under assets/fonts/) ->
// (subsetted woff2 under public/fonts/). styles/fonts.ts loads each output by
// exactly these paths, so renaming an output here means renaming it there too.
//
// Mono is Meslo LG *M* specifically, not S or L: the three LG variants differ
// only in vertical metrics, and M's ascent/descent (2101/-683 per 2048 upem,
// a 1.359 default line box) is the closest of the three to the JetBrains Mono
// it replaced (1020/-300 per 1000 upem, 1.320). S at 1.262 and L at 1.555
// would both visibly re-flow the mono chips and metadata rows whose line
// height globals.css leaves at `normal`.
const FONT_TARGETS = [
  {
    label: "open-huninn-subset.woff2",
    sourcePath: path.join(rootDir, "assets/fonts/jf-openhuninn-2.1.ttf"),
    outputPath: path.join(rootDir, "public/fonts/open-huninn-subset.woff2"),
  },
  {
    label: "meslo-lgm-regular-subset.woff2",
    sourcePath: path.join(rootDir, "assets/fonts/meslo-lgm-regular-1.2.1.ttf"),
    outputPath: path.join(
      rootDir,
      "public/fonts/meslo-lgm-regular-subset.woff2",
    ),
  },
  {
    label: "meslo-lgm-bold-subset.woff2",
    sourcePath: path.join(rootDir, "assets/fonts/meslo-lgm-bold-1.2.1.ttf"),
    outputPath: path.join(rootDir, "public/fonts/meslo-lgm-bold-subset.woff2"),
  },
] as const;

// Recursively collect files under `dir` whose name passes `matches(name)`.
// No glob dependency exists in this project, so we walk manually.
function collectFiles(
  dir: string,
  matches: (name: string) => boolean,
  exclude?: (fullPath: string) => boolean,
): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (exclude && exclude(fullPath)) continue;

    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, matches, exclude));
    } else if (entry.isFile() && matches(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Source extensions that can contain rendered copy. Phase 4 migrated every
// page and component from .js to .ts/.tsx, which made the previous
// `.endsWith(".js")` filters match ZERO files -- the subset silently shrank
// from 15296 B to 14804 B across the migration. .js/.jsx stay listed so the
// scan does not break again in the other direction.
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const isSourceFile = (name: string): boolean =>
  SOURCE_EXTENSIONS.some((ext) => name.endsWith(ext));

// Site-wide scan scope: the JSON content source, every rendered page, the Wood
// component tree, and the Markdown project bodies under _projects/ (the single
// surviving Markdown content directory -- the legacy component tree and the old
// post sources were deleted in phase 03). `* { font-family: var(--font-sans) }`
// in styles/globals.css makes Open Huninn the font for every surface, so any
// content directory left out here silently drops its glyphs from the subset.
//
// styles/ is deliberately NOT scanned: globals.css's every `content:` rule is
// the empty string `""` and styles/fonts.ts holds only identifiers and CSS
// variable names -- neither contributes a rendered glyph. Verified by
// inspection in plan 04-09; re-check if a `content: "<glyph>"` is ever added.
const pageFiles = collectFiles(
  path.join(rootDir, "pages"),
  isSourceFile,
  (fullPath) => fullPath.includes(`${path.sep}pages${path.sep}api${path.sep}`),
);
const componentFiles = collectFiles(
  path.join(rootDir, "components"),
  isSourceFile,
);
const projectFiles = collectFiles(path.join(rootDir, "_projects"), (name) =>
  name.endsWith(".md"),
);
// lib/ was outside the scan scope until phase 6 (LOC-06). It holds
// lib/dictionary.ts -- the Traditional Chinese UI chrome strings (nav labels,
// the language-switcher label, footer and 404 copy) that live outside
// data/portfolio.json. Left unscanned, those strings render in a fallback
// font with no error anywhere: the build passes, the glyphs are simply not in
// the subset. *.test.ts is excluded the same way pages/api/ is -- test files
// are never rendered, so their literals would inflate the subset for nothing.
const libFiles = collectFiles(
  path.join(rootDir, "lib"),
  isSourceFile,
  (fullPath) => fullPath.endsWith(".test.ts") || fullPath.endsWith(".test.tsx"),
);

// Fail loud instead of silently emitting an under-covered subset. An empty
// branch here means the scan scope has drifted away from the real source
// layout again -- exactly the failure mode above, which stayed invisible only
// because the site is 100% English today and the printable-ASCII range below
// is always unioned in. Once Phase 5 ships Traditional Chinese copy, a drifted
// scope would drop real CJK glyphs and render that copy in a fallback font.
let scanScopeBroken = false;
for (const [label, found] of [
  ["pages", pageFiles],
  ["components", componentFiles],
  ["_projects", projectFiles],
  ["lib", libFiles],
] as const) {
  if (found.length === 0) {
    console.error(
      `ERROR: subset-font scanned 0 files under ${label}/ -- its glyphs would be ` +
        `missing from the subset. Check SOURCE_EXTENSIONS against the real file layout.`,
    );
    scanScopeBroken = true;
  }
}
if (scanScopeBroken) {
  process.exit(1);
}

// data/portfolio.zh.json is listed separately on purpose: the JSON content
// sources are the only files named by explicit path here, so a sibling
// .zh.json is NOT picked up by any collector. The existsSync filter below
// keeps this run green before plan 06-04 creates that file.
const filesToScan = [
  path.join(rootDir, "data/portfolio.json"),
  path.join(rootDir, "data/portfolio.zh.json"),
  ...pageFiles,
  ...componentFiles,
  ...projectFiles,
  ...libFiles,
].filter((filePath) => fs.existsSync(filePath));

// Build the set of distinct characters actually used across the scanned
// content, unioned with the full printable-ASCII range so English copy is
// always covered even if a future edit temporarily removes it (01-03
// precedent).
const usedChars = new Set<string>();
for (const filePath of filesToScan) {
  const content = fs.readFileSync(filePath, "utf8");
  for (const char of content) {
    usedChars.add(char);
  }
}
for (let codePoint = 0x20; codePoint <= 0x7e; codePoint++) {
  usedChars.add(String.fromCharCode(codePoint));
}
const subsetText = Array.from(usedChars).join("");

console.log(
  `Scanned ${filesToScan.length} files; ${usedChars.size} distinct characters to subset.`,
);

(async () => {
  // subset-font ships no type declarations (no `types` field, no .d.ts), so
  // this local signature documents the single call shape this script uses.
  const subsetFont: (
    source: Buffer,
    text: string,
    options: { targetFormat: "woff2" | "woff" | "truetype" | "sfnt" },
  ) => Promise<Buffer> = require("subset-font");

  for (const { label, sourcePath, outputPath } of FONT_TARGETS) {
    const sourceBuffer = fs.readFileSync(sourcePath);
    const subsetBuffer = await subsetFont(sourceBuffer, subsetText, {
      targetFormat: "woff2",
    });

    // public/fonts/ holds nothing but this script's own output, and those
    // woff2 files are gitignored -- so git carries no empty directory for
    // them and a fresh checkout (CI, or a clone) has no public/fonts/ at all.
    // Create it before the first write or every clean build dies on ENOENT.
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, subsetBuffer);

    console.log(
      `Subsetted ${label}: ${sourceBuffer.length} bytes -> ${subsetBuffer.length} bytes ` +
        `(${usedChars.size} distinct characters requested).`,
    );
  }
})().catch((err) => {
  console.error("subset-font failed:", err);
  process.exit(1);
});
