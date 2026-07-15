// ESLint flat config. eslint-config-next 16 ships a native flat-config array
// (no FlatCompat/eslintrc bridge needed) — import the core-web-vitals preset
// directly, preserving the identical ruleset the legacy .eslintrc.json used.
import * as espree from "espree";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextCoreWebVitals,
  {
    // eslint-config-next's bundled parser (next/dist/compiled/babel/eslint-parser)
    // is vendored inside the installed `next` package. This repo is still on
    // Next 15.5.3 (the Next 16 bump is a later slice), and that older bundled
    // parser is incompatible with ESLint 10's scope-manager API. Fall back to
    // ESLint's built-in parser (espree) — this codebase is plain modern
    // JS/JSX/ESM with no Babel-only syntax, so no functional loss.
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
    rules: {
      // eslint-config-next 16 bundles eslint-plugin-react-hooks@7, a major bump that
      // adds a large set of new React-Compiler-readiness rules on top of the classic
      // pair (rules-of-hooks, exhaustive-deps) the prior 15.5.3 ruleset enforced. Those
      // new rules fire "error" on pre-existing legacy components across the repo
      // (components/Header, components/WorkCard, pages/blog/*, pages/edit.js,
      // pages/index.js) — files this tooling-only task does not touch. Downgraded to
      // warn (not silenced) so they stay visible for a future phase to fix; this
      // preserves the old ruleset's pass/fail surface (zero regression) instead of
      // gating this task's build on unrelated pre-existing code. See deferred-items.md.
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
    files: ["components/wood/**/*.js"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*/lib/projects", "@/lib/projects", "**/lib/projects"],
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
