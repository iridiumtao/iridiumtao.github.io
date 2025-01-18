import fs from "fs";
import { join } from "path";

export default function handler(req, res) {
  const portfolioData = join(process.cwd(), "/data/portfolio.json");
  if (process.env.NODE_ENV === "development") {
    if (req.method === "POST") {
      try {
        fs.writeFileSync(
            portfolioData,
            JSON.stringify(req.body, null, 2),
            "utf-8"
        );
        console.log("File written successfully.");
      } catch (err) {
        console.error("Error writing file:", err);
      }
    }
  } else {
    res
        .status(200)
        .json({ name: "This route works in development mode only" });
  }
}
