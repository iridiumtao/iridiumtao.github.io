// pages/resume.page.tsx
// The ENGLISH résumé page — a locale binding, not an implementation. The whole
// body lives in components/wood/pages/ResumePage.tsx and is shared with
// pages/zh/resume.page.tsx (D-03, ZH-06). The public/resumes listing is read
// HERE on purpose: a page file may touch the filesystem at build time,
// components/wood/* may not. This file's locale is a literal constant — never
// computed, never detected — and travels to the shared chrome as
// pageProps.locale, which pages/_app.page.tsx feeds to LocaleProvider.
import React from "react";
import fs from "fs";
import path from "path";
import ResumePage from "../components/wood/pages/ResumePage";
import type { ResumeDownload } from "../components/wood/pages/ResumePage";
import type { Locale } from "../lib/locale";

const LOCALE: Locale = "en";

export async function getStaticProps(): Promise<{
  props: { resumes: ResumeDownload[]; locale: Locale };
}> {
  const resumesDir = path.join(process.cwd(), "public", "resumes");
  let resumes: ResumeDownload[] = [];

  try {
    const filenames = fs.readdirSync(resumesDir);
    resumes = filenames
      .filter((filename) => filename.endsWith(".pdf"))
      .map((filename) => {
        const purpose = filename.replace("resume-", "").replace(".pdf", "");
        let name = purpose.toUpperCase();
        if (purpose === "swe") name = "Software Engineer";
        else if (purpose === "ml") name = "ML Engineer";
        else if (purpose === "ios") name = "iOS Developer";
        else if (purpose === "ex") name = "Extended";
        else if (purpose === "mlops") name = "MLOps Engineer";

        return { url: `/resumes/${filename}`, name, purpose };
      })
      .reverse();
  } catch (error) {
    // Distinguish "not generated yet" from a real failure. prepare-resumes.ts
    // runs on prebuild and should have populated this directory, so anything
    // other than ENOENT here is a regression that would otherwise ship a résumé
    // page with zero download links.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(
        "public/resumes missing — expected only before prepare-resumes runs",
      );
    } else {
      console.error("Failed to read public/resumes:", error);
    }
  }

  return { props: { resumes, locale: LOCALE } };
}

export default function Resume({ resumes }: { resumes: ResumeDownload[] }) {
  return <ResumePage locale={LOCALE} resumes={resumes} />;
}
