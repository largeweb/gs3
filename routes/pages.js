import { Router } from "express";
import { promises as fs } from "fs";
import * as path from "path";
import { glob } from "glob";

const router = Router();

// Get all pages for a specific project
router.get("/:projectName", async (req, res) => {
  try {
    const { projectName } = req.params;
    const projectPath = path.join(process.cwd(), "projects", projectName);

    // Use glob to find all page.tsx files, excluding node_modules
    const pages = await glob("**/page.tsx", {
      cwd: projectPath,
      ignore: ["**/node_modules/**"],
      absolute: true
    });

    // Format the pages data
    const pagesData = pages.map(pagePath => ({
      path: pagePath.replace(projectPath, ""),
      name: path.dirname(pagePath.replace(projectPath, "")).replace(/^\/app\/?/, "") || "root"
    }));

    res.json({ pages: pagesData });
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// Get specific page content
router.get("/:projectName/content", async (req, res) => {
  try {
    const { projectName } = req.params;
    const { pagePath } = req.query;

    if (!pagePath) {
      return res.status(400).json({ error: "Page path is required" });
    }

    const fullPath = path.join(process.cwd(), "projects", projectName, pagePath);
    const content = await fs.readFile(fullPath, "utf-8");

    res.json({ content });
  } catch (error) {
    console.error("Failed to fetch page content:", error);
    res.status(500).json({ error: "Failed to fetch page content" });
  }
});

export { router as pagesRouter };
