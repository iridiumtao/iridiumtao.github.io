// scripts/subset-font.ts
// Regenerates public/fonts/open-huninn-subset.woff2 on every predev/prebuild
// by scanning the site's actual rendered content (site-wide, not just the
// Wood pages) for distinct characters and re-subsetting the committed
// hermetic source font (assets/fonts/jf-openhuninn-2.1.ttf) with a pure
// Node/WASM subsetter (subset-font, backed by harfbuzzjs) -- no Python, no
// manual re-subsetting step. Mirrors scripts/prepare-resumes.ts's style:
// plain CommonJS, fs/path only, console.log progress lines.
//
// Deliberately CommonJS (require/__dirname, no import/export): Node runs this
// file directly from the lifecycle hooks and strips its type annotations at
// runtime; a top-level import/export would flip it to ESM and break `require`.
// The `typeof import(...)` annotations are type-position only and fully erased.
const fs: typeof import("fs") = require("fs");
const path: typeof import("path") = require("path");

const rootDir = path.join(__dirname, "..");
const sourceFontPath = path.join(rootDir, "assets/fonts/jf-openhuninn-2.1.ttf");
const outputFontPath = path.join(
  rootDir,
  "public/fonts/open-huninn-subset.woff2",
);

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

// Site-wide scan scope: the JSON content source, every rendered page, the Wood
// component tree, and the Markdown project bodies under _projects/ (the single
// surviving Markdown content directory -- the legacy component tree and the old
// post sources were deleted in phase 03). `* { font-family: var(--font-sans) }`
// in styles/globals.css makes Open Huninn the font for every surface, so any
// content directory left out here silently drops its glyphs from the subset.
const filesToScan = [
  path.join(rootDir, "data/portfolio.json"),
  ...collectFiles(
    path.join(rootDir, "pages"),
    (name) => name.endsWith(".js"),
    (fullPath) => fullPath.includes(`${path.sep}pages${path.sep}api${path.sep}`),
  ),
  ...collectFiles(path.join(rootDir, "components"), (name) =>
    name.endsWith(".js"),
  ),
  ...collectFiles(path.join(rootDir, "_projects"), (name) =>
    name.endsWith(".md"),
  ),
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

  const sourceBuffer = fs.readFileSync(sourceFontPath);
  const subsetBuffer = await subsetFont(sourceBuffer, subsetText, {
    targetFormat: "woff2",
  });

  fs.writeFileSync(outputFontPath, subsetBuffer);

  console.log(
    `Subsetted open-huninn-subset.woff2: ${sourceBuffer.length} bytes -> ${subsetBuffer.length} bytes ` +
      `(${usedChars.size} distinct characters).`,
  );
})();
