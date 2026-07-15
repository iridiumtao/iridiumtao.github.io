// scripts/download-project-images.mjs
// Idempotent, dependency-free downloader that localizes each project's cover
// image (referenced by data/portfolio.json's imageSrc) into
// public/images/projects/{slug}.{ext} and rewrites imageSrc to the local path.
//
// ESM (.mjs) because package.json has no "type": "module" — existing scripts
// under scripts/ use CommonJS require() and must keep working untouched.
//
// Usage: node scripts/download-project-images.mjs
import fs from "fs";
import path from "path";

const CONTENT_TYPE_TO_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const portfolioPath = path.join(process.cwd(), "data", "portfolio.json");
const outDir = path.join(process.cwd(), "public", "images", "projects");

const raw = fs.readFileSync(portfolioPath, "utf8");
const data = JSON.parse(raw);

fs.mkdirSync(outDir, { recursive: true });

let mutated = false;

for (const project of data.projects ?? []) {
  if (!project.slug) {
    console.warn(`Skipping project id=${project.id}: no slug yet`);
    continue;
  }
  if (!/^https?:\/\//.test(project.imageSrc)) {
    console.log(`Skipping ${project.slug}: already local (${project.imageSrc})`);
    continue;
  }

  const res = await fetch(project.imageSrc);
  if (!res.ok) {
    console.error(`Failed to fetch ${project.imageSrc}: HTTP ${res.status}`);
    continue;
  }

  const contentType = res.headers.get("content-type")?.split(";")[0];
  const ext = CONTENT_TYPE_TO_EXT[contentType] || "png";
  const buffer = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(outDir, `${project.slug}.${ext}`);
  fs.writeFileSync(outPath, buffer);
  console.log(`Wrote ${outPath} (${buffer.length} bytes, ${contentType})`);

  project.imageSrc = `/images/projects/${project.slug}.${ext}`;
  mutated = true;
}

if (mutated) {
  fs.writeFileSync(portfolioPath, JSON.stringify(data, null, 2) + "\n");
  console.log(`Updated ${portfolioPath}`);
}
