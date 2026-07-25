// pages/zh/resume.page.tsx
// The CHINESE résumé page — a locale binding, not an implementation. It renders
// the same components/wood/pages/ResumePage.tsx its English twin does; only the
// `locale` constant differs (D-03, ZH-06).
//
// THIS FILE LANDED EARLY. The /zh/ route tree belongs to plan 06-09; this one
// arrived during 06-08 because the Chinese branch of the extracted résumé page
// cannot be verified by inspection — it needs a real binding to build against.
// Plan 06-09 should RECONCILE with this file rather than create a second one.
//
// Two things 06-09 owns and this file deliberately does not attempt: the rest
// of the /zh/ tree (home, 404, showcase), and the fact that the public/resumes
// listing below is duplicated from pages/resume.page.tsx. The duplication is
// the plan's instruction — "keep the getStaticProps filesystem read in the page
// file" — but two copies of a purpose→label map WILL drift (this file shipped
// its first draft missing the `ml` entry). 06-09 should decide whether to hoist
// the listing into one build-time helper both bindings call.
import React from "react";
import fs from "fs";
import path from "path";
import ResumePage from "../../components/wood/pages/ResumePage";
import type { ResumeDownload } from "../../components/wood/pages/ResumePage";
import type { Locale } from "../../lib/locale";

const LOCALE: Locale = "zh";

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
        // The labels stay English on purpose: they name English-language PDFs.
        // A Chinese résumé PDF is deferred (ZHPDF-01/02) and must not be
        // implied by translating the label of a document that is not written
        // in Chinese.
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
    // Same ENOENT-versus-real-error posture as the English binding: anything
    // other than "not generated yet" is a regression that would otherwise ship
    // a résumé page with zero download links.
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

export default function ZhResume({ resumes }: { resumes: ResumeDownload[] }) {
  return <ResumePage locale={LOCALE} resumes={resumes} />;
}
