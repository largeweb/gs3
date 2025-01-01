import { Router } from "express";
import { promises as fs } from "fs";
import * as path from "path";
import { readSettings } from "./settings.js"; // We'll need to export readSettings from settings.js
import { exec } from "child_process";
import { promisify } from "util";
import { streamWithXMLProcessing } from '../app/lib/agent-api.js';
import { spawn } from 'child_process';

const execAsync = promisify(exec);
const router = Router();

const activeProcesses = new Map();

class ProcessManager {
    static addProcess(projectId, process) {
        activeProcesses.set(projectId, process);
    }

    static removeProcess(projectId) {
        const process = activeProcesses.get(projectId);
        if (process) {
            process.kill();
            activeProcesses.delete(projectId);
        }
    }

    static getProcess(projectId) {
        return activeProcesses.get(projectId);
    }

    static killAll() {
        for (const process of activeProcesses.values()) {
            process.kill();
        }
        activeProcesses.clear();
    }
}

// Add cleanup on server shutdown
process.on('SIGINT', () => {
    console.log('🧹 Cleaning up processes before shutdown...');
    ProcessManager.killAll();
    process.exit();
});

// Add a base log to debug route matching
router.use((req, res, next) => {
    console.log(`🎯 Incoming ${req.method} request to: ${req.path}`);
    next();
});

router.use((req, res, next) => {
    console.log(`🎯 Projects Router: ${req.method} ${req.path}`);
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

router.post('/create-with-codebase', async (req, res) => {
    console.log("🏗️ Time to build something from existing blueprints!");
    const { title, codebasePath } = req.body;
    const projectPath = path.join(process.cwd(), 'projects', title);
    const logsPath = path.join(projectPath, 'gs3-logs.txt');

    console.log(`📂 Blueprint source: ${codebasePath}`);

    try {
        console.log("🎨 Creating your masterpiece...");
        await fs.mkdir(projectPath, { recursive: true });
        console.log("📝 Getting ready to take notes...");
        const writeStream = await fs.open(logsPath, 'a');

        // Import and use the workflow
        const { analyzeCodebase } = await import('../workflows/codebase-analysis.js');
        const analysisPrompt = await analyzeCodebase(codebasePath);

        console.log("🤖 AI analysis in progress, grab a coffee!");
        await streamWithXMLProcessing(
            analysisPrompt,
            {
                onTag: async (tag) => {
                    console.log("✍️ Writing wisdom to the logs...");
                    await writeStream.write(tag + '\n');
                },
                onError: (error) => {
                    console.error('🌋 AI had a brain freeze:', error);
                }
            }
        );

        console.log("✨ Project creation complete! Time to celebrate!");
        await writeStream.close();
        res.json({ success: true });
    } catch (error) {
        console.error("💥 Oops! The creation spell backfired:", error);
        res.status(500).json({ error: error.message });
    }
});

console.log("🔍 Registering validate-path route...");

router.post('/validate-path', async (req, res) => {
    console.log("🔍 Path validation quest initiated! Let's see what we're dealing with...");
    const { path: requestPath } = req.body;
    console.log(`📂 Investigating path: "${requestPath}"`);

    try {
        // For absolute paths, use them directly; for relative paths, resolve from cwd
        const absolutePath = path.isAbsolute(requestPath)
            ? requestPath
            : path.resolve(process.cwd(), requestPath);

        console.log(`🧭 Absolute path decoded: "${absolutePath}"`);

        console.log("🚀 Launching directory probe...");
        const stats = await fs.stat(absolutePath);

        if (stats.isDirectory()) {
            console.log("🎯 Eureka! We've found a genuine directory!");
            res.json({
                success: true,
                path: absolutePath
            });
        } else {
            console.log("🤔 This looks more like a file than a directory!");
            res.status(400).json({
                success: false,
                error: 'Selected path is not a directory'
            });
        }
    } catch (error) {
        console.error('🕵️ Path validation investigation failed:', error);
        res.status(400).json({
            success: false,
            error: 'Invalid path or directory does not exist'
        });
    }
});

router.post('/server', async (req, res) => {
    const { command, projectId } = req.body;
    console.log(`🚀 Starting server for project ${projectId} with command: ${command}`);

    try {
        // Check if project already has a running process
        if (ProcessManager.getProcess(projectId)) {
            return res.status(400).json({
                error: 'A server is already running for this project'
            });
        }

        // Set up response for streaming
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        const [cmd, ...args] = command.split(' ');
        const child = spawn(cmd, args, {
            cwd: process.cwd(), // We'll need to update this to the project directory
            shell: true
        });

        ProcessManager.addProcess(projectId, child);

        // Stream stdout
        child.stdout.on('data', (data) => {
            const output = data.toString();
            // Check for port conflict in the output
            if (output.includes('EADDRINUSE')) {
                res.write('Error: Port is already in use. Please ensure no other server is running on this port.\n');
                ProcessManager.removeProcess(projectId);
                res.end();
                return;
            }
            res.write(output);
        });

        // Stream stderr
        child.stderr.on('data', (data) => {
            const error = data.toString();
            // Check for port conflict in stderr
            if (error.includes('EADDRINUSE')) {
                res.write('Error: Port is already in use. Please ensure no other server is running on this port.\n');
                ProcessManager.removeProcess(projectId);
                res.end();
                return;
            }
            res.write(error);
        });

        // Handle process completion
        child.on('close', (code) => {
            res.write(`\nProcess exited with code ${code}`);
            ProcessManager.removeProcess(projectId);
            res.end();
        });

        // Cleanup on request close
        req.on('close', () => {
            ProcessManager.removeProcess(projectId);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add cleanup route
router.delete('/server', (req, res) => {
    const { projectId } = req.body;
    console.log(`🛑 Stopping server for project ${projectId}...`);
    try {
        ProcessManager.removeProcess(projectId);
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to stop server:', error);
        res.status(500).json({ error: error.message });
    }
});

export { router as projectsRouter };
