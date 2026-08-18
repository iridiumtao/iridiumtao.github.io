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

// macOS + Homebrew: sharp's Pango text renderer needs fontconfig to locate
// fonts, but Homebrew's fontconfig config file is not on the default search
// path. Without this, Pango silently falls back to a system sans-serif.
if (!process.env.FONTCONFIG_FILE) {
  const brewConf = "/opt/homebrew/etc/fonts/fonts.conf";
  if (fs.existsSync(brewConf)) process.env.FONTCONFIG_FILE = brewConf;
}

/* ── Composition constants ────────────────────────────────────────────── */

const WIDTH = 1200;
const HEIGHT = 630;

// Verified against styles/globals.css, not copied from memory.
const PAPER = "#fbf7f2";
const INK = "#1f1a15";
const MUTED = "#6b5b4e";
const RULE = "#dabea7";

const WORDMARK = "Chun-Ju (Iridium) Tao";
const SPECIALISMS = "Backend, DevOps, Cloud System";
const HOST = new URL(SITE_ORIGIN).host;

const MARGIN_X = 100;

// Absolute path required by sharp's fontfile option.
const FONT_FILE = path.resolve(
  import.meta.dirname,
  "..",
  "assets/fonts/jf-openhuninn-2.1.ttf",
);

/* ── Render ───────────────────────────────────────────────────────────── */

// Hairline rule as a minimal SVG.
const ruleSvg = Buffer.from(
  `<svg width="${WIDTH - MARGIN_X * 2}" height="2">` +
    `<rect width="${WIDTH - MARGIN_X * 2}" height="2" fill="${RULE}"/>` +
    `</svg>`,
);

const outputPath = path.join(
  import.meta.dirname,
  "..",
  "public",
  "images",
  "og-default.png",
);

await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: PAPER,
  },
})
  .composite([
    {
      input: {
        text: {
          text: `<span foreground="${INK}" size="${84 * 1024}">${WORDMARK}</span>`,
          font: "jf-openhuninn-2.1",
          fontfile: FONT_FILE,
          rgba: true,
          dpi: 72,
        },
      },
      left: MARGIN_X,
      top: 190,
    },
    {
      input: {
        text: {
          text: `<span foreground="${MUTED}" size="${34 * 1024}">${SPECIALISMS}</span>`,
          font: "jf-openhuninn-2.1",
          fontfile: FONT_FILE,
          rgba: true,
          dpi: 72,
        },
      },
      left: MARGIN_X,
      top: 310,
    },
    {
      input: ruleSvg,
      left: MARGIN_X,
      top: 380,
    },
    {
      input: {
        text: {
          text: `<span foreground="${MUTED}" size="${26 * 1024}">${HOST}</span>`,
          font: "jf-openhuninn-2.1",
          fontfile: FONT_FILE,
          rgba: true,
          dpi: 72,
        },
      },
      left: MARGIN_X,
      top: 410,
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

const bytes = fs.statSync(outputPath).size;

console.log(
  `Wrote public/images/og-default.png: ${WIDTH}x${HEIGHT}, ${bytes} bytes.`,
);
