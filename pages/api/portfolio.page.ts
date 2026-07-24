// pages/api/portfolio.page.ts
// Dev-only writer for the site's two locale-keyed content files
// (data/portfolio.json and data/portfolio.zh.json), POSTed to by
// pages/edit.dev.tsx. Absent from the static export (output: "export" drops
// pages/api/*), so this only ever runs under `next dev`. In any
// non-development NODE_ENV it answers with a static notice instead of touching
// the filesystem.
//
// PATH WHITELIST — the load-bearing property of this file (T-kbk-01): the write
// target is produced ONLY by indexing CONTENT_FILE_BY_LOCALE with a value that
// lib/locale.ts's isLocale has already narrowed to Locale. No request-supplied
// string is ever concatenated, interpolated, or joined into a path, and the
// locale check runs before any filesystem expression in the handler is
// evaluated. An unknown locale is a 400, never a default — there is
// deliberately no bare-object back-compat branch that would write English.
import fs from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { type Locale, isLocale } from "../../lib/locale.ts";

// The closed set of writable content files. Both values are string literals
// written out here and nowhere else; relative to the repo root, never absolute.
// Adding a third locale to lib/locale.ts without adding its file here fails
// pages/api/portfolio.test.ts's map-integrity assertion.
export const CONTENT_FILE_BY_LOCALE: Record<Locale, string> = {
  en: "data/portfolio.json",
  zh: "data/portfolio.zh.json",
};

/**
 * The only place a locale becomes a path. Returns the whitelisted relative
 * file for a value isLocale accepts, and null for everything else.
 *
 * Pure by design — no fs, no working-directory lookup, no I/O — so the
 * whitelist can be proven against hostile inputs in a unit test without
 * booting a server.
 */
export function resolveContentPath(locale: unknown): string | null {
  return isLocale(locale) ? CONTENT_FILE_BY_LOCALE[locale] : null;
}

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

  // The accepted body is a two-field envelope: { locale, content }. The locale
  // is carried alongside the content, never inside it — PortfolioData has no
  // such field, so an embedded locale would fail lib/portfolio.ts's `satisfies`
  // check on the next `yarn typecheck`.
  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({ name: "Expected a JSON object body" });
  }
  const body = req.body as Record<string, unknown>;

  // Narrow before touching the filesystem: nothing below this point may run
  // until the locale is a Locale and the path came out of the whitelist.
  const contentFile = resolveContentPath(body.locale);
  if (contentFile === null) {
    return res
      .status(400)
      .json({ name: 'Expected `locale` to be exactly "en" or "zh"' });
  }

  // Guard the content source against a malformed payload: anything that is not
  // a plain object would overwrite a content file with garbage.
  const content = body.content;
  if (
    typeof content !== "object" ||
    content === null ||
    Array.isArray(content)
  ) {
    return res
      .status(400)
      .json({ name: "Expected `content` to be a JSON object" });
  }

  try {
    // Trailing newline: without it every save left the content file with a
    // "\ No newline at end of file" diff, so the editor showed up as a dirty
    // working tree even when nothing had actually changed.
    fs.writeFileSync(
      join(process.cwd(), contentFile),
      JSON.stringify(content, null, 2) + "\n",
      "utf-8",
    );
    return res.status(200).json({ name: "ok" });
  } catch (err) {
    console.error("Error writing file:", err);
    return res.status(500).json({ name: "write failed" });
  }
}
