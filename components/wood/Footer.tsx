// components/wood/Footer.tsx
import React from "react";
import data from "../../lib/portfolio";

// Shared Wood Editorial footer.
export default function Footer() {
  const socials = data.socials.filter((s) => s.title !== "Resume");
  return (
    <footer>
      <span className="footer-brand">{data.name} Tao</span>
      <div className="footer-links">
        {socials.map((s) => (
          <a key={s.title} href={s.link}>
            {s.title}
            {s.link.startsWith("http") ? " ↗" : ""}
          </a>
        ))}
      </div>
      <span className="footer-copy">© 2026 · PIT + TPE</span>
    </footer>
  );
}
