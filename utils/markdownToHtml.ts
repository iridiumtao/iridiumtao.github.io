// utils/markdownToHtml.ts
// Renders a Markdown string to an HTML string via remark. Used at build time
// by lib/projects.ts to render _projects/*.md bodies.
import { remark } from "remark";
import html from "remark-html";

export default async function markdownToHtml(
  markdown: string,
): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
