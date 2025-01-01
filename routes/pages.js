import { Router } from "express";
import { promises as fs } from "fs";
import * as path from "path";
import { glob } from "glob";

const router = Router();

// Get all pages for a specific project
router.get("/:projectName", async (req, res) => {
  console.log("📚 Page hunter initiated for project:", req.params.projectName);
  try {
    const { projectName } = req.params;
    const projectPath = path.join(process.cwd(), "projects", projectName);

    // Use glob to find all page.tsx files, excluding node_modules
    console.log("🔍 Searching for pages like a detective...");
    const pages = await glob("**/page.tsx", {
      cwd: projectPath,
      ignore: ["**/node_modules/**"],
      absolute: true
    });
    console.log(`📖 Found ${pages.length} pages in the wild!`);

    // Format the pages data
    const pagesData = pages.map(pagePath => ({
      path: pagePath.replace(projectPath, ""),
      name: path.dirname(pagePath.replace(projectPath, "")).replace(/^\/app\/?/, "") || "root"
    }));

    res.json({ pages: pagesData });
  } catch (error) {
    console.error("📑 Pages playing hide and seek:", error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// Get specific page content
router.get("/:projectName/content", async (req, res) => {
  console.log("📄 Page content request incoming!");
  try {
    const { projectName } = req.params;
    const { pagePath } = req.query;

    if (!pagePath) {
      console.log("❓ Someone forgot to tell us which page they want!");
      return res.status(400).json({ error: "Page path is required" });
    }

    console.log("📎 Fetching content from:", pagePath);
    const fullPath = path.join(process.cwd(), "projects", projectName, pagePath);
    const content = await fs.readFile(fullPath, "utf-8");

    res.json({ content });
  } catch (error) {
    console.error("📝 Content retrieval mission failed:", error);
    res.status(500).json({ error: "Failed to fetch page content" });
  }
});

export { router as pagesRouter };
