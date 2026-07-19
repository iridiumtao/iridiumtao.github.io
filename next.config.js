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
  // EDIT-01: pages/edit.dev.jsx is a page ONLY in dev. In production it matches
  // none of the listed extensions, so Next treats it as a non-page file (the
  // documented "including non-page files in the pages directory" mechanism) and
  // it never reaches out/. A plain `.dev.js` suffix would NOT work: extension
  // matching is suffix-based, so `edit.dev.js` still matches "js" and would
  // build as a real route.
  //
  // "js" must stay in BOTH lists — _app.js, _document.js and pages/api/*.js
  // depend on it.
  //
  // WARNING: any future page authored with a plain .jsx extension will silently
  // vanish from production builds. New pages must be .js, .ts, or .tsx.
  pageExtensions: isDev ? ["dev.jsx", "js", "ts", "tsx"] : ["js", "ts", "tsx"],
};

module.exports = nextConfig;
