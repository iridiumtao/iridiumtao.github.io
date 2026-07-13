import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

// Self-hosted display font: CJK-subsetted Open Huninn (SIL OFL 1.1), vendored
// under public/fonts/. See .planning/phases/01-foundation-tooling-design-tokens/used-chars.txt
const huninn = localFont({
  src: "../public/fonts/open-huninn-subset.woff2",
  variable: "--font-huninn",
  display: "swap",
  preload: true,
});

// Self-hosted via next/font/google — downloaded + hashed at build time, so
// the browser never requests fonts.googleapis.com / fonts.gstatic.com.
const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jbmono",
  display: "swap",
});

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      {/* Layout-neutral wrapper so --font-huninn / --font-jbmono are ancestors
          of all .we content, without altering page layout. */}
      <div
        className={`${huninn.variable} ${jbmono.variable}`}
        style={{ display: "contents" }}
      >
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
};

export default App;
