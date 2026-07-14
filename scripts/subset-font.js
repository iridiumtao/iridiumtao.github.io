// scripts/subset-font.js
// Regenerates public/fonts/open-huninn-subset.woff2 on every predev/prebuild
// by scanning the site's actual rendered content (site-wide, not just the
// Wood pages) for distinct characters and re-subsetting the committed
// hermetic source font (assets/fonts/jf-openhuninn-2.1.ttf) with a pure
// Node/WASM subsetter (subset-font, backed by harfbuzzjs) -- no Python, no
// manual re-subsetting step. Mirrors scripts/prepare-resumes.js's style:
// plain CommonJS, fs/path only, console.log progress lines.
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const sourceFontPath = path.join(rootDir, "assets/fonts/jf-openhuninn-2.1.ttf");
const outputFontPath = path.join(
  rootDir,
  "public/fonts/open-huninn-subset.woff2",
);

// Recursively collect files under `dir` whose name passes `matches(name)`.
// No glob dependency exists in this project, so we walk manually.
function collectFiles(dir, matches, exclude) {
  const results = [];
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

// Site-wide scan scope -- widens 01-03's Wood-only scope to also cover the
// legacy component tree and blog posts, since `* { font-family: var(--font-sans) }`
// in styles/globals.css makes Open Huninn the font for every surface.
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
  ...collectFiles(path.join(rootDir, "_posts"), (name) => name.endsWith(".md")),
].filter((filePath) => fs.existsSync(filePath));

// Build the set of distinct characters actually used across the scanned
// content, unioned with the full printable-ASCII range so English copy is
// always covered even if a future edit temporarily removes it (01-03
// precedent).
const usedChars = new Set();
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
  const subsetFont = require("subset-font");

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
