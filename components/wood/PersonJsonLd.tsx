// components/wood/PersonJsonLd.tsx
// The schema.org Person JSON-LD block for the home page, in whichever locale
// the page is rendering (GH-3).
//
// WHY THIS IS NOT PART OF LocaleHead.tsx (D-3): a concurrent branch owns that
// file. Folding the block in there would put the same file on two open PRs and
// hand the owner a merge conflict to resolve during review. LocaleHead.tsx must
// come out of this task byte-identical. Once both have merged, consolidating
// them is a reasonable follow-up -- but it is a follow-up, not this change.
//
// This file holds NO field logic and NO content strings. Every value comes from
// lib/personJsonLd.ts, which is pure and fully covered by `node --test`; that
// split is what keeps the entire published payload under test, since a Head
// component is not something the native test runner can render.
//
// Do not "simplify" the serializer call by dropping in JSON.stringify: the
// escape it applies to every `<` is what stops a content value containing
// "</script>" from terminating this element and having its remainder parsed as
// markup (D-7, T-vav-01). dangerouslySetInnerHTML bypasses React's escaping, so
// nothing else on this path would catch it.
//
// Kept pure ASCII (D-9): scripts/subset-font.ts scans components/, so a literal
// glyph here would change the emitted font subset for a string no visitor ever
// reads. English comments only, per CLAUDE.md.
import Head from "next/head";
import {
  buildPersonJsonLd,
  serializePersonJsonLd,
} from "../../lib/personJsonLd";
import type { Locale } from "../../lib/locale";

export default function PersonJsonLd({ locale }: { locale: Locale }) {
  return (
    <Head>
      {/* next/head dedupes its children by key. Without one, a re-render can
          leave two copies of the block in the document -- and two conflicting
          Person entities is worse for a crawler than none. */}
      <script
        key="person-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializePersonJsonLd(buildPersonJsonLd(locale)),
        }}
      />
    </Head>
  );
}
