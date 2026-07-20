// utils/markdownToHtml.ts
// Renders a Markdown string to an HTML string via remark. Used at build time
// by lib/projects.ts to render _projects/*.md bodies.
import { remark } from "remark";
import html from "remark-html";

// Trust boundary: remark-html >= 14 sanitizes by DEFAULT (lib/index.js sets
// allowDangerousHtml = false and runs hast-util-sanitize unless `sanitize` is
// explicitly passed) -- the old `sanitize: false` default belonged to v13 and
// earlier. Raw HTML in a _projects/*.md body is therefore already stripped, so
// the returned string is safe for dangerouslySetInnerHTML. Do NOT pass
// `sanitize: false` here without re-auditing every consumer.
export default async function markdownToHtml(
  markdown: string,
): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
