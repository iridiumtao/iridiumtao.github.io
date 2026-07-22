// lib/blogRedirects.ts
// Derive-once old→new slug map for the /blog/[slug] redirect shim (D-08b).
// Hard-coded so nothing depends on _posts/ surviving — that directory is
// deleted later this phase (D-10). Keys are the raw decoded old-blog slugs
// (the _posts/*.md filename minus ".md"), verbatim including spaces,
// apostrophes, and parentheses. Values are the real data/portfolio.json
// project slugs, verified against the Phase-2 slug table in 03-RESEARCH.md.
export const OLD_TO_NEW_SLUG: Record<string, string> = {
  "AI Editor-in-Chief and Virtual News Presenter": "virtual-news-presenter",
  "iOS Development": "swiftui-weather-app",
  "Loud Plants in Your Area": "loud-plants-in-your-area",
  "Oblivilight - OpenHCI'25": "openhci25-oblivilight",
  Retailpia: "retailpia",
  "RISC-V-Simulator": "risc-v-simulator",
  "Taigi (Taiwanese-Hokkien) Medical Advising LLM":
    "taigi-medical-advising-llm",
  "TW-COVID-Bot (Telegram Bot)": "tw-covid-bot",
};
