// ESLint flat config. eslint-config-next 16 ships a native flat-config array
// (no FlatCompat/eslintrc bridge needed) — import the core-web-vitals preset
// directly, preserving the identical ruleset the legacy .eslintrc.json used.
import * as espree from "espree";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextCoreWebVitals,
  {
    // eslint-config-next's bundled parser (next/dist/compiled/babel/eslint-parser)
    // is vendored inside the installed `next` package and is incompatible with
    // ESLint 10's scope-manager API, which is why this repo pins ESLint 9.
    // Fall back to ESLint's built-in parser (espree) — this codebase is plain
    // modern JS/JSX/ESM with no Babel-only syntax, so no functional loss.
    // Scoped to plain JS/JSX files only (files glob added in Phase 2, plan
    // 02-01): without a `files` restriction this object applies globally and
    // clobbers nextCoreWebVitals's own typescript-eslint/parser assignment for
    // **/*.ts and **/*.tsx (Phase 2 introduces lib/projects.ts) — espree cannot
    // parse TypeScript syntax, which would break `yarn lint` on any .ts file.
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: espree,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    // Severity downgrades, kept SEPARATE from the espree block above and
    // deliberately extension-agnostic. Phase 4, plan 04-08: these rules used to
    // live in the JS-only block, so migrating a file to .tsx silently promoted
    // its findings from warn back to error — pages/edit.dev.tsx alone flipped 7
    // warnings into build-gating errors purely by being renamed. That is the
    // same stale-glob failure 04-03 fixed for components/wood/**; scoping a
    // severity policy by file extension re-introduces it on every migration.
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts}"],
    rules: {
      // eslint-config-next 16 bundles eslint-plugin-react-hooks@7, a major bump that
      // adds a large set of new React-Compiler-readiness rules on top of the classic
      // pair (rules-of-hooks, exhaustive-deps) the prior ruleset enforced. Those new
      // rules originally fired "error" across the legacy component tree, which phase
      // 03 has since deleted; the surviving offenders are the remaining page-level
      // components. Downgraded to warn (not silenced) so they stay visible for a
      // future pass to fix, preserving the old ruleset's pass/fail surface (zero
      // regression) rather than gating builds on it. See deferred-items.md.
      "react-hooks/static-components": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/config": "warn",
      "react-hooks/gating": "warn",
    },
  },
  {
    ignores: ["public/**"],
  },
  {
    // DATA-05 static boundary: lib/projects.ts performs synchronous fs calls
    // at build time and must never ship into the client bundle. This is the
    // static half of the enforcement (the runtime half is assertServerOnly()
    // in lib/projects.ts) — see 02-RESEARCH.md "Server-only Enforcement"
    // (the `server-only` npm package is not viable under Pages Router).
    // Glob widened in Phase 4, plan 04-03 (D-19): the wood tier is now .tsx,
    // so the previous .js-only glob matched nothing and this rule had silently
    // stopped firing. Keep this in sync with the wood tier's file extensions.
    files: ["components/wood/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // Both the extensionless and the extension-exact ".ts" spelling
              // must be listed: no-restricted-imports matches the specifier
              // string literally, so "../../lib/projects.ts" does NOT match
              // "**/lib/projects". Phase 4 plan 04-02 made extension-exact
              // specifiers a real in-repo convention (Node's native ESM loader
              // requires them under `node --test`), so this is a spelling a
              // future author would plausibly reach for, not a contrived one.
              group: [
                "*/lib/projects",
                "@/lib/projects",
                "**/lib/projects",
                "*/lib/projects.ts",
                "@/lib/projects.ts",
                "**/lib/projects.ts",
              ],
              message:
                "lib/projects.ts is server-only (build-time fs access). " +
                "Import it only from getStaticProps/getStaticPaths in pages/*.js.",
            },
          ],
        },
      ],
    },
  },
];
