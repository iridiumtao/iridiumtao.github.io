// lib/portfolio.ts
// The single typed accessor for data/portfolio.json (D-06). Import this instead
// of the raw JSON so a content edit that breaks the shape fails `yarn typecheck`
// here, in one place, rather than silently at a call site.
//
// The JSON import attribute is required for Node's native ESM loader (used
// directly by `node --test`) and remains valid under both tsc's "bundler"
// resolution and Next.js's build pipeline — same form as lib/projects.ts.
import rawPortfolioData from "../data/portfolio.json" with { type: "json" };
import type { PortfolioData } from "../types/portfolio";

// Compile-time check only — no runtime validation by design (D-05: no new
// dependency). `satisfies` keeps the narrow inferred literal types intact
// while asserting the JSON structurally matches PortfolioData.
const portfolioData = rawPortfolioData satisfies PortfolioData;

export default portfolioData;
