// pages/api/portfolio.page.ts
// Dev-only writer for data/portfolio.json, POSTed to by pages/edit.dev.tsx.
// Absent from the static export (output: "export" drops pages/api/*), so this
// only ever runs under `next dev`. In any non-development NODE_ENV it answers
// with a static notice instead of touching the filesystem.
import fs from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";

// The only response body this route ever sends. Note the development branch
// sends no response at all — preserved as-is here (this plan is types-only);
// that and the unvalidated body write are tracked as EDIT-02 in Phase 5.
type PortfolioApiResponse = { name: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PortfolioApiResponse>,
) {
  const portfolioData = join(process.cwd(), "/data/portfolio.json");
  if (process.env.NODE_ENV === "development") {
    if (req.method === "POST") {
      try {
        fs.writeFileSync(
          portfolioData,
          JSON.stringify(req.body, null, 2),
          "utf-8",
        );
        console.log("File written successfully.");
      } catch (err) {
        console.error("Error writing file:", err);
      }
    }
  } else {
    res.status(200).json({ name: "This route works in development mode only" });
  }
}
