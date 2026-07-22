// components/wood/ProjectCard.tsx
// Whole-card Link into a project's showcase page (HOME-02, D-06). Receives
// the project object as a prop — must never import lib/projects (server-only
// data module; blocked by the ESLint no-restricted-imports rule scoped to
// components/wood/**). The card is one single clickable element: no new-tab
// attribute, no rel, no nested anchor — repo/demo links live only on the
// showcase page.
import React from "react";
import Link from "next/link";
// Types-only import: types/portfolio.ts carries no runtime fs code, so it is
// safe for this client component — the server-only module noted above is not.
import type { Project } from "../../types/portfolio";

// First 4-digit year found in a date string.
function endYear(d: string): string {
  const m = String(d || "").match(/\d{4}/);
  return m ? m[0] : "";
}

export default function ProjectCard({
  p,
  size = "small",
}: {
  p: Project;
  size?: "large" | "small";
}) {
  return (
    <Link className="proj" href={`/projects/${p.slug}`}>
      <div className={`proj-img ${size}`}>
        <img src={p.imageSrc} alt={p.title} loading="lazy" />
        {endYear(p.endDate) && (
          <span className="badge">{endYear(p.endDate)}</span>
        )}
      </div>
      <h3>{p.title}</h3>
      {p.subtitle && <span className="proj-sub">{p.subtitle}</span>}
      <p>{p.description}</p>
    </Link>
  );
}
