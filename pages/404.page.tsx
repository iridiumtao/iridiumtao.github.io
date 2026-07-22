// pages/404.page.tsx
// Wood-styled custom 404 (PROJ-05). Next exports this to out/404.html;
// GitHub Pages serves it automatically for unknown paths. No data fetching —
// static content only.
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../components/wood/Nav";
import Footer from "../components/wood/Footer";

export default function NotFound() {
  return (
    <div className="we">
      <Head>
        <title>404 — Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="wrap">
        <Nav />

        <header className="resume-head">
          <span className="kicker">404</span>
          <h1>Page not found</h1>
          <p className="desc">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has
            moved.
          </p>
          <div className="resume-downloads">
            <Link href="/">← Back to home</Link>
          </div>
        </header>

        <Footer />
      </div>
    </div>
  );
}
