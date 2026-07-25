// scripts/generate-og-image.ts
// Regenerates public/images/og-default.png, the 1200x630 share card every route
// falls back to (components/wood/LocaleHead.tsx's DEFAULT_OG_IMAGE).
//
// DELIBERATELY NOT WIRED INTO predev / prebuild / deploy.yml. A future reader
// will be tempted to "fix" that; do not. Three reasons:
//
//   1. The PNG is a stable committed asset. It changes only when the OWNER
//      changes the wording on the card — not when content, code or routes
//      change. Regenerating it on a schedule it does not follow buys nothing.
//   2. CI (.github/workflows/deploy.yml) invokes the `next` binary directly and
//      so bypasses the prebuild hook entirely; it runs only subset-font.ts as an
//      explicit step. Wiring this in would mean growing that CI step AND making
//      `sharp` — with its platform-specific native binaries — load-bearing for
//      the deploy. The share card is not worth that.
//   3. Rebuilding an unchanged image on every `yarn dev` boot is pure waste on
//      the hot path the owner uses most.
//
// public/images/og-default.png is GENERATED build output, in the same class as
// public/sitemap.xml, public/resumes/*.pdf and public/fonts/open-huninn-subset
// .woff2: it is committed to the repo, but it is never hand-edited. Change the
// wording here and re-run `yarn og-image`.
//
// ESM, following scripts/generate-sitemap.ts rather than its two CommonJS
// neighbours (subset-font.ts, prepare-resumes.ts). Same reason generate-sitemap
// is: this script must reuse lib/site.ts's SITE_ORIGIN instead of re-spelling
// the domain, and a CommonJS file here cannot `import` from lib/*.ts. Node
// content-detects ESM from the `import` statements. Do not convert it to match
// its neighbours — they differ on purpose.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SITE_ORIGIN } from "../lib/site.ts";

/* ── Composition constants ────────────────────────────────────────────── */

const WIDTH = 1200;
const HEIGHT = 630;

// Verified against styles/globals.css, not copied from memory:
// --color-paper (L50), --color-wood-800 (L39), --color-wood-500 (L36) and
// --color-stone-200 (L77, annotated "hairline rules" in the source, which is
// exactly the role it plays here).
const PAPER = "#fbf7f2";
const INK = "#1f1a15";
const MUTED = "#6b5b4e";
const RULE = "#dabea7";

// No font file is embedded. librsvg resolves font-family through the SYSTEM, so
// the stack has to be generic and every glyph has to be one a system serif
// actually carries. That is also why all of this text is Latin: a CJK glyph
// here would be a fallback lottery on whatever machine runs the script. Do NOT
// try to embed public/fonts/open-huninn-subset.woff2 — it is CJK-scoped build
// output and loading it through sharp is unverified.
const SERIF = "Georgia, 'Times New Roman', serif";

// The wordmark EXACTLY as the site's own chrome composes it (data.name +
// dictionary brandSuffix — Nav.tsx, Footer.tsx, ProjectPage.tsx and now
// lib/portfolio.ts's wordmark()). Parentheses, not quotes: the rendered site
// says "Chun-Ju (Iridium) Tao", and a share card that disagreed with the page
// it links to would be its own small lie. English-only by design (D-1): one
// locale-invariant card, matching LocaleHead's English-only alt text.
const WORDMARK = "Chun-Ju (Iridium) Tao";

// The three public specialisms, as stated on the live site. U+00B7 MIDDLE DOT
// separators; present in Georgia, and visually confirmed in the generated PNG
// rather than assumed.
const SPECIALISMS = "MLOps · Applied ML · Scalable Cloud Systems";

// Bare host, derived from the ONE place the domain is spelled (lib/site.ts).
// Never typed a second time.
const HOST = new URL(SITE_ORIGIN).host;

// Every line is its own absolutely-positioned <text>: librsvg does not wrap.
// Content stays inside ~100px margins because LINE and Telegram each crop this
// image differently — the safe area is real, not decorative.
const MARGIN_X = 100;

/* ── Render ───────────────────────────────────────────────────────────── */

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}"/>
  <text x="${MARGIN_X}" y="258" fill="${INK}" font-family="${SERIF}" font-size="84">${WORDMARK}</text>
  <text x="${MARGIN_X}" y="328" fill="${MUTED}" font-family="${SERIF}" font-size="34">${SPECIALISMS}</text>
  <rect x="${MARGIN_X}" y="378" width="${WIDTH - MARGIN_X * 2}" height="2" fill="${RULE}"/>
  <text x="${MARGIN_X}" y="430" fill="${MUTED}" font-family="${SERIF}" font-size="26">${HOST}</text>
</svg>
`;

const outputPath = path.join(
  import.meta.dirname,
  "..",
  "public",
  "images",
  "og-default.png",
);

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outputPath);

const bytes = fs.statSync(outputPath).size;

console.log(
  `Wrote public/images/og-default.png: ${WIDTH}x${HEIGHT}, ${bytes} bytes.`,
);
