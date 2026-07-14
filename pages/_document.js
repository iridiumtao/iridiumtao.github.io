// pages/_document.js
// Custom Document — anchors <Html suppressHydrationWarning> so next-themes'
// pre-hydration <html> class mutation (light/dark) never triggers a React
// hydration-mismatch warning. next/font loaders must NOT live here — they
// stay in pages/_app.js.
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
