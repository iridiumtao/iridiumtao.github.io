// pages/blog/[slug].js
// Redirect shim — the SOLE intentional survivor of the blog retirement
// (PROJ-06's named exception). The old /blog/<slug> showcase pages are live
// at HTTP 200 today (D-07); this file keeps those real, indexed URLs working
// by client-side redirecting to the new /projects/<slug> showcase page
// (PROJ-07, D-08). Static export supports no server redirects, so this page
// IS the redirect: getStaticPaths enumerates OLD_TO_NEW_SLUG (never _posts/
// or utils/api — that directory is deleted later this phase), and the
// rendered page carries three redirect paths — router.replace (instant with
// JS), a meta refresh (works with JS disabled), and a visible fallback link —
// plus a canonical link and a noindex tag so search engines transfer
// authority to the new URL.
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { OLD_TO_NEW_SLUG } from "../../lib/blogRedirects";
import { SITE_ORIGIN } from "../../lib/site";

export async function getStaticPaths() {
  return {
    paths: Object.keys(OLD_TO_NEW_SLUG).map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: { target: `/projects/${OLD_TO_NEW_SLUG[params.slug]}/` },
  };
}

export default function BlogRedirect({ target }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(target); // replace, not push — old URL leaves history
  }, [router, target]);

  return (
    <>
      <Head>
        <title>Redirecting…</title>
        <meta httpEquiv="refresh" content={`0;url=${target}`} />
        <link rel="canonical" href={`${SITE_ORIGIN}${target}`} />
        <meta name="robots" content="noindex" />
      </Head>
      <p>
        This page moved.{" "}
        <Link href={target}>Continue to the project page →</Link>
      </p>
    </>
  );
}
