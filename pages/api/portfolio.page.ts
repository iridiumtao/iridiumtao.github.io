// pages/api/portfolio.page.ts
// Dev-only writer for data/portfolio.json, POSTed to by pages/edit.dev.tsx.
// Absent from the static export (output: "export" drops pages/api/*), so this
// only ever runs under `next dev`. In any non-development NODE_ENV it answers
// with a static notice instead of touching the filesystem.
import fs from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";

// The only response body this route ever sends. Every code path must return a
// response — the previous development branch wrote the file and returned
// without touching `res`, hanging the editor's POST until the client timed out.
type PortfolioApiResponse = { name: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PortfolioApiResponse>,
) {
  if (process.env.NODE_ENV !== "development") {
    return res
      .status(200)
      .json({ name: "This route works in development mode only" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ name: "Method not allowed" });
  }

  // Guard the single content source against a malformed payload: anything
  // that is not a plain object would overwrite portfolio.json with garbage.
  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({ name: "Expected a JSON object body" });
  }

  const portfolioData = join(process.cwd(), "/data/portfolio.json");
  try {
    fs.writeFileSync(portfolioData, JSON.stringify(req.body, null, 2), "utf-8");
    return res.status(200).json({ name: "ok" });
  } catch (err) {
    console.error("Error writing file:", err);
    return res.status(500).json({ name: "write failed" });
  }
}
