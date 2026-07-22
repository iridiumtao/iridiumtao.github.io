/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  // Restore the previous scroll offset on back/forward. The Pages Router
  // defaults this to false, which is why returning from a project showcase
  // dropped the visitor at the top of the homepage instead of back at the
  // card they clicked. It is a client-side sessionStorage mechanism, so it
  // survives the static export. Still namespaced `experimental` in Next 16
  // — if a future major moves or removes it, the fallback is today's
  // behaviour (back goes to top), not a build failure.
  experimental: {
    scrollRestoration: true,
  },
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
  // The transitional "dev.jsx" entry was dropped in Plan 04-08 once the editor
  // became pages/edit.dev.tsx; it is now the only `.dev.*` file in the tree.
  //
  // WARNING: a new page file without a `.page.` suffix will silently vanish from
  // production builds. New pages must be named `<name>.page.tsx` (or .ts/.js).
  pageExtensions: isDev
    ? ["dev.tsx", "page.tsx", "page.ts", "page.js"]
    : ["page.tsx", "page.ts", "page.js"],
};

module.exports = nextConfig;
