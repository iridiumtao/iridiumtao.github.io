// pages/_app.page.tsx
// Custom App — wraps every page in next-themes' ThemeProvider.
import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
// Side-effect-only import: registers styles/fonts.ts's font-loader modules in
// this page's webpack entrypoint ("/_app"), which is what Next's built-in
// `getNextFontLinkTags` (pages/_document internals) reads to emit
// `<link rel="preload" as="font">` tags — it only ever checks the "/_app"
// and current-page manifest entries, never "/_document". The actual
// `.variable` classNames are applied to <Html> in pages/_document.page.tsx;
// this import exists solely to keep font preloading working now that the font
// loaders are no longer called directly inside this file.
import "../styles/fonts";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { countPageview, goatcounterEndpoint } from "../lib/analytics";

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  // count.js counts the FIRST page load by itself, but this site routes on the
  // client — clicking a project card never reloads the document — so every
  // navigation after the first would go uncounted. routeChangeComplete covers
  // exactly those, with no overlap with the script's own onload count, so
  // nothing is double-counted. Left as a no-op when analytics is unconfigured.
  useEffect(() => {
    if (!goatcounterEndpoint) return;
    router.events.on("routeChangeComplete", countPageview);
    return () => router.events.off("routeChangeComplete", countPageview);
  }, [router.events]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <Component {...pageProps} />
      {goatcounterEndpoint && (
        // afterInteractive, not beforeInteractive: analytics must never sit on
        // the critical path of a portfolio whose visitors are mostly on phones.
        // count.js skips localhost on its own, so `yarn dev` never reaches the
        // network and the stats stay clean without a NODE_ENV guard here.
        <Script
          strategy="afterInteractive"
          src="https://gc.zgo.at/count.js"
          data-goatcounter={goatcounterEndpoint}
        />
      )}
    </ThemeProvider>
  );
};

export default App;
