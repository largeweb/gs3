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

// Create a new page
router.post("/:projectName", async (req, res) => {
  try {
    const { projectName } = req.params;
    const { pageName, content } = req.body;

    const projectPath = path.join(process.cwd(), "projects", projectName);
    const pagePath = path.join(projectPath, "app", pageName, "page.tsx");

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(pagePath), { recursive: true });

    // Create default page content if none provided
    const pageContent = content || `export default function ${pageName.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <div>
      <h1>${pageName} Page</h1>
    </div>
  );
}`;

    await fs.writeFile(pagePath, pageContent, 'utf-8');
    res.json({ success: true, path: pagePath });
  } catch (error) {
    console.error("Failed to create page:", error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

// Update existing page
router.put("/:projectName", async (req, res) => {
  try {
    const { projectName } = req.params;
    const { pagePath, content } = req.body;

    const fullPath = path.join(process.cwd(), "projects", projectName, pagePath);
    await fs.writeFile(fullPath, content, 'utf-8');

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update page:", error);
    res.status(500).json({ error: "Failed to update page" });
  }
});

// Delete page
router.delete("/:projectName", async (req, res) => {
  try {
    const { projectName } = req.params;
    const { pagePath } = req.body;

    // Sanitize the path similar to page creation
    const sanitizedPath = pagePath
      .toLowerCase()
      .replace(/[^a-z0-9\/]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const projectPath = path.join(process.cwd(), "projects", projectName);
    const fullPath = path.join(projectPath, sanitizedPath);
    const pageDir = path.dirname(fullPath);

    console.log("🗑️ Deleting page directory:", pageDir);

    // First, ensure the directory exists
    try {
      await fs.access(pageDir);
    } catch {
      throw new Error("Page directory not found");
    }

    // Delete the directory and all its contents recursively
    await fs.rm(pageDir, { recursive: true, force: true });

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete page:", error);
    res.status(500).json({ error: error.message || "Failed to delete page" });
  }
});

export { router as pagesRouter };
