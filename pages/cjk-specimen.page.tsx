// pages/cjk-specimen.page.tsx
// Permanent CJK font-check fixture (D-01, D-02). Unlinked from every nav/index
// and marked noindex — reachable only by typing /cjk-specimen/. The Traditional
// Chinese copy below is a deliberately designed type specimen, not prose:
// scripts/subset-font.ts scans this file's rendered text, so whatever sits
// here DEFINES the site's CJK glyph floor. Never delete; regenerate the font
// subset (node scripts/subset-font.ts) whenever this text changes.
import Head from "next/head";

export default function CjkSpecimen() {
  return (
    // lang tags the CJK subtree: _document.page.tsx sets <Html lang="en">, and
    // an untagged specimen would get Latin line-breaking/font heuristics and the
    // wrong screen-reader voice. For a page whose whole job is proving CJK
    // rendering, the language tag is part of what is being proven.
    <div className="we" lang="zh-Hant-TW">
      <Head>
        <title>{"CJK Font Specimen — chun-ju"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="wrap">
        {/* Heading weight — .resume-head h1 (clamp 40–72px) */}
        <section className="resume-head">
          <h1>中文字型樣本頁</h1>
          <p className="desc">
            本頁面用於驗證網站的中文顯示字型（開源的「粉圓」／Open
            Huninn字型）是否正確載入並正常呈現，涵蓋常見的正體中文字與標點符號。
          </p>
        </section>

        {/* Subhead weight — .sec-head h2 (38px) */}
        <div className="sec-head">
          <h2>台灣正體中文字型呈現測試</h2>
        </div>

        {/* Mixed CJK / Latin / numeral setting */}
        <p>混排範例：MLOps 工程、Next.js 16、2026 年、NYU 研究所。</p>

        {/* Full-width punctuation coverage */}
        <p>全形標點：「引號」，句號。頓號、問號？驚嘆號！破折號——刪節號……</p>

        {/* Small / caption weight — .exp-blurb (13px) */}
        <p className="exp-blurb">
          此頁面設定為 noindex，未連結至任何導覽或索引，僅供字型回歸測試使用。
        </p>
      </div>
    </div>
  );
}
