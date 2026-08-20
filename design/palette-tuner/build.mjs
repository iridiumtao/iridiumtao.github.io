// design/palette-tuner/build.mjs
// Builds index.html for the palette tuner from shell.html + tuner.css +
// color.js + tuner.app.js, injecting the real site content so the preview is
// never a mock-up of the site's typography.
//
// Two output modes, because the file serves two different purposes:
//   default    asset URLs stay relative (~40 KB). This is the committed
//              artifact -- a 700 KB base64 blob does not belong in the history
//              of a repo with a five-year horizon.
//   --inline   font and images embedded as data: URIs, producing one
//              self-contained file that opens anywhere. Written to
//              index.inline.html, which .gitignore excludes.
//
// Run from anywhere:  node design/palette-tuner/build.mjs [--inline]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const inline = process.argv.includes("--inline");

const read = (p) => readFileSync(join(HERE, p), "utf8");
const asset = (repoPath, mime) =>
  inline
    ? `data:${mime};base64,${readFileSync(join(ROOT, repoPath)).toString("base64")}`
    : // Relative to design/palette-tuner/, resolved against the repo root when
      // served from there (see README).
      `../../${repoPath}`;

// data/portfolio.json is the single content source (see CLAUDE.md); only the
// handful of fields the preview renders are pulled through, so a content edit
// elsewhere can never silently change what this tool shows.
const data = JSON.parse(readFileSync(join(ROOT, "data/portfolio.json"), "utf8"));
const content = {
  name: data.name,
  home: {
    greeting: data.home.greeting,
    availability: data.home.availability,
    based: data.home.based,
    stack: data.home.stack,
    aboutPull: data.home.aboutPull,
  },
};

// The node-only export line is stripped: the browser gets one concatenated
// script, so the CommonJS tail would throw there.
const color = read("color.js").replace(/^if\s*\(typeof module[\s\S]*$/m, "");

const app = read("tuner.app.js")
  .replace("__DATA__", JSON.stringify(content))
  .replace("__IMG_DIAGRAM__", JSON.stringify(asset("public/images/projects/taigi-medical-advising-llm.png", "image/png")))
  .replace("__IMG_PHOTO__", JSON.stringify(asset("public/images/projects/loud-plants-in-your-area.jpg", "image/jpeg")));

const shell = read("shell.html");

// Guard against a malformed shell shipping silently. The first version of this
// tool was assembled by slicing the template out of a scratch generator, and a
// mismatched end marker left the generator's own tail pasted after </script>,
// where it rendered as a visible text node over the preview. Cheap to assert,
// and it fails at build time instead of in the browser.
for (const token of ["__FONT__", "__CSS__", "__COLOR__", "__APP__"]) {
  if (!shell.includes(token)) throw new Error(`shell.html is missing ${token}`);
}
if (!shell.trimEnd().endsWith("</script>")) {
  throw new Error("shell.html must end at </script> - trailing content renders as page text");
}

const html = shell
  .replace("__FONT__", asset("public/fonts/open-huninn-subset.woff2", "font/woff2"))
  .replace("__CSS__", read("tuner.css"))
  .replace("__COLOR__", color)
  .replace("__APP__", app);

const out = inline ? "index.inline.html" : "index.html";
writeFileSync(join(HERE, out), html);
console.log(`${out}  ${(html.length / 1024).toFixed(0)} KB  (${inline ? "self-contained" : "relative asset URLs"})`);
