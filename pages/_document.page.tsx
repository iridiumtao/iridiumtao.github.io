// pages/_document.page.tsx
// Custom Document — anchors <Html suppressHydrationWarning> so next-themes'
// pre-hydration <html> class mutation (light/dark) never triggers a React
// hydration-mismatch warning. next/font loaders must NOT live here — they
// stay in styles/fonts.ts (the single font-definitions module); this file
// only imports the already-instantiated `.variable` string constants and
// applies them directly to <Html>, the true document root. <html> is
// unconditionally not `display:contents`, so font-family resolution never
// depends on inheriting through any intermediate wrapper — next-themes only
// ever classList.add/remove's the theme token here, never overwrites
// className wholesale, so these classes are never clobbered at runtime.
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import { huninn, meslo } from "../styles/fonts";
import { HTML_LANG, localeFromPathname, type Locale } from "../lib/locale";

type Props = DocumentInitialProps & { locale: Locale };

export default function MyDocument({ locale }: Props) {
  return (
    <Html
      // Per-route language tag (SEO-01, D-07). Derived from the route in
      // getInitialProps below rather than hardcoded, so /zh/* serves the
      // Traditional Chinese tag while everything else stays "en". HTML_LANG
      // is a fixed lookup keyed by the closed Locale union — never string
      // interpolation of a pathname — so no route shape can inject an
      // arbitrary lang value here.
      lang={HTML_LANG[locale]}
      suppressHydrationWarning
      // globals.css sets `scroll-behavior: smooth` on <html> for in-page
      // anchor jumps (#projects, #work, #about). Without this attribute that
      // also animated Next's scroll-to-top on every route change, so clicking
      // a project card visibly scrolled the OLD page to the top before the new
      // one appeared. Next reads this marker in
      // disableSmoothScrollDuringRouteTransition and flips scroll-behavior to
      // `auto` around its own scrollTo — anchor smoothness is unaffected. The
      // dev build warns on the console when it is missing.
      data-scroll-behavior="smooth"
      className={`${huninn.variable} ${meslo.variable}`}
    >
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// _document renders once per exported page, each with its own DocumentContext,
// so ctx.pathname is the file-route pattern for the page being built (e.g.
// "/zh/projects/[slug]") — populated during static export, not only under SSR.
// localeFromPathname's safe fallback to "en" covers the defensive case; it
// never throws, because ctx is Next's own machinery rather than a repo
// invariant.
MyDocument.getInitialProps = async (ctx: DocumentContext): Promise<Props> => {
  const initialProps = await Document.getInitialProps(ctx);
  return { ...initialProps, locale: localeFromPathname(ctx.pathname) };
};
