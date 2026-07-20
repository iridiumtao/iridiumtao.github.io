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

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default App;
