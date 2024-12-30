import { Router } from "express";
import { promises as fs } from "fs";
import * as path from "path";
import { readSettings } from "./settings.js"; // We'll need to export readSettings from settings.js
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = Router();

// Add a base log to debug route matching
router.use((req, res, next) => {
    console.log(`🎯 Incoming ${req.method} request to: ${req.path}`);
    next();
});

router.get("/", async (req, res) => {
    console.log(
        "🎮 Why did the project manager cross the road? To get to the other side... of the sprint board!"
    );
    try {
        const settings = await readSettings();
        console.log("🗂️ Looking for projects in:", settings.projectsPath);

        const projectsPath =
            settings.projectsPath || path.join(process.cwd(), "projects");
        console.log("📁 Final projects path:", projectsPath);

        // Check if directory exists
        try {
            await fs.access(projectsPath);
            console.log("🎯 Directory found! Time to peek inside...");
        } catch {
            console.log(
                "🏗️ Projects directory doesn't exist, creating it now..."
            );
            await fs.mkdir(projectsPath, { recursive: true });
        }

        const items = await fs.readdir(projectsPath, { withFileTypes: true });
        console.log(
            "📦 Found items in directory:",
            items.map((i) => i.name)
        );

        const projects = await Promise.all(
            items
                .filter((item) => {
                    const isDir = item.isDirectory();
                    console.log(
                        `🔍 Checking ${item.name}: ${
                            isDir ? "is a directory" : "not a directory"
                        }`
                    );
                    return isDir;
                })
                .map(async (dir) => {
                    const projectPath = path.join(projectsPath, dir.name);
                    console.log(
                        `🔎 Checking project: ${dir.name} at ${projectPath}`
                    );
                    let hasSettings = false;

                    try {
                        await fs.access(
                            path.join(projectPath, "gs3-settings.json")
                        );
                        hasSettings = true;
                        console.log(`✨ Found settings for ${dir.name}`);
                    } catch {
                        console.log(`📝 No settings found for ${dir.name}`);
                    }

                    return { name: dir.name, path: projectPath, hasSettings };
                })
        );

        console.log("🎉 Final projects list:", projects);
        res.json({ projects });
    } catch (error) {
        console.error("💥 Oops! The project explorer tripped:", error);
        res.status(500).json({ error: "Failed to read projects" });
    }
});

router.post("/create", async (req, res) => {
    console.log("🎨 Creating new project...");
    try {
        const { title, softwareType } = req.body;
        const settings = await readSettings();

        const projectsPath = settings.projectsPath || path.join(process.cwd(), "projects");
        const templatePath = path.join(process.cwd(), "templates", "next-cloudflare");
        const newProjectPath = path.join(projectsPath, title);

        console.log(`📁 Creating project directory: ${newProjectPath}`);
        await fs.mkdir(newProjectPath, { recursive: true });

        console.log("📋 Copying template files...");
        await execAsync(`cp -r ${templatePath}/* ${newProjectPath}`);

        console.log("📦 Installing dependencies...");
        const { stdout, stderr } = await execAsync('npm install', { cwd: newProjectPath });

        console.log("✨ Project created successfully!");
        res.json({
            success: true,
            path: newProjectPath,
            logs: {
                stdout,
                stderr
            }
        });
    } catch (error) {
        console.error("💥 Project creation failed:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export { router as projectsRouter };
