// components/wood/Nav.tsx
import React from "react";
import Link from "next/link";
import data from "../../lib/portfolio";

// Shared Wood Editorial navigation. On the homepage, section links are
// in-page anchors; elsewhere they jump back to the homepage sections.
//
// `back` swaps the trailing CTA from "Resume →" to "← Home". The résumé page
// passes it because a button linking to the page you are already on is dead
// weight, and it is the one page with no other route out.
export default function Nav({
  home = false,
  back = false,
}: {
  home?: boolean;
  back?: boolean;
}) {
  const base = home ? "" : "/";
  return (
    <nav>
      <Link href="/" className="brand">
        <span className="mark">T</span>
        <span className="name">{data.name} Tao</span>
      </Link>
      <div className="nav-links">
        <a href={`${base}#projects`}>Projects</a>
        <a href={`${base}#work`}>Work</a>
        <a href={`${base}#about`}>About</a>
        <a href={data.home.contactEmail}>Contact</a>
        {back ? (
          <Link href="/" className="cta">
            ← Home
          </Link>
        ) : (
          <Link href="/resume" className="cta">
            Resume →
          </Link>
        )}
      </div>
    </nav>
  );
}
