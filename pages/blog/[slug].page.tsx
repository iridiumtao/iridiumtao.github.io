// pages/blog/[slug].page.tsx
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
import type { GetStaticPaths, GetStaticProps } from "next";
import { OLD_TO_NEW_SLUG } from "../../lib/blogRedirects";
import { SITE_ORIGIN } from "../../lib/site";

type Props = { target: string };

// The dynamic segment this route generates. Passed as GetStaticProps' second
// type argument so `params` is narrowed from ParsedUrlQuery to this exact shape.
type Params = { slug: string };

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  return {
    paths: Object.keys(OLD_TO_NEW_SLUG).map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  // `fallback: false` means only slugs enumerated by getStaticPaths — i.e. keys
  // of OLD_TO_NEW_SLUG — ever reach here, so both branches below are unreachable
  // in practice. They throw rather than coalesce because a silent fallback would
  // emit a redirect to "/projects/undefined/", shipping a broken live URL; a
  // build-time throw surfaces the drift instead.
  const newSlug = params ? OLD_TO_NEW_SLUG[params.slug] : undefined;
  if (!newSlug) {
    throw new Error(
      `No /projects redirect target for old blog slug "${params?.slug}". ` +
        "lib/blogRedirects.ts and getStaticPaths have drifted apart.",
    );
  }

  return {
    props: { target: `/projects/${newSlug}/` },
  };
};

export default function BlogRedirect({ target }: Props) {
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
