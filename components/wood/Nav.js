import React from "react";
import Link from "next/link";
import data from "../../data/portfolio.json";

// Shared Wood Editorial navigation. On the homepage, section links are
// in-page anchors; elsewhere they jump back to the homepage sections.
export default function Nav({ home = false }) {
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
        <Link href="/resume" className="cta">
          Resume →
        </Link>
      </div>
    </nav>
  );
}
