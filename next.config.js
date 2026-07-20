/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  output: isDev ? undefined : "export",
  images: {
    unoptimized: true,
  },
  // SHIP-01: the static export emits route/index.html directories, so both
  // /resume and /resume/ resolve on GitHub Pages.
  trailingSlash: true,
  // EDIT-01 / TS-01 (D-01): every REAL page carries an explicit `.page.*` suffix
  // (index.page.tsx, api/portfolio.page.ts, ...), and the dev-only editor carries
  // a `.dev.*` suffix. Production lists only the `.page.*` forms, so the editor
  // matches nothing and Next treats it as a non-page file (the documented
  // "including non-page files in the pages directory" mechanism) — it never
  // reaches out/.
  //
  // WHY THE `.page.*` CONVENTION AND NOT A BARE EXTENSION LIST: extension
  // matching is suffix-based. Under the old `["js", "ts", "tsx"]` list a marker
  // file named `edit.dev.js` still matched "js", and renaming the editor to
  // `edit.dev.tsx` for TS-01 would have matched "tsx" — silently shipping a
  // filesystem-writing editor as a real production route. Suffixing every real
  // page instead removes that collision class permanently: no page-file naming
  // choice can ever accidentally match the dev-only marker.
  //
  // "dev.jsx" is TRANSITIONAL: the editor is still pages/edit.dev.jsx until it
  // is converted to pages/edit.dev.tsx (Plan 04-08). Drop "dev.jsx" from the dev
  // list at that point. It is absent from the prod list either way.
  //
  // WARNING: a new page file without a `.page.` suffix will silently vanish from
  // production builds. New pages must be named `<name>.page.tsx` (or .ts/.js).
  pageExtensions: isDev
    ? ["dev.tsx", "dev.jsx", "page.tsx", "page.ts", "page.js"]
    : ["page.tsx", "page.ts", "page.js"],
};

module.exports = nextConfig;
