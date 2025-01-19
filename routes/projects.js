import { Router } from "express";
import { promises as fs } from "fs";
import * as path from "path";
import { readSettings } from "./settings.js"; // We'll need to export readSettings from settings.js
import { exec } from "child_process";
import { promisify } from "util";
import { streamWithXMLProcessing } from '../app/lib/agent-api.js';
import { spawn } from 'child_process';
import { codebaseTools, systemPrompt, userPrePrompt, userPostPrompt } from '../agents/codebase-analyzer.js';
import { analyzeProjectWithPTGen } from '../workflows/project-analysis.js';

const execAsync = promisify(exec);
const router = Router();

// Add CORS headers
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

const activeProcesses = new Map();

class ProcessManager {
    static addProcess(projectId, process) {
        console.log(`📝 Adding process ${process.pid} for project ${projectId}`);
        activeProcesses.set(projectId, {
            pid: process.pid,
            process: process
        });
    }

    static removeProcess(projectId) {
        const processInfo = activeProcesses.get(projectId);
        if (processInfo) {
            console.log(`🔪 Killing process ${processInfo.pid} for project ${projectId}`);
            try {
                // Kill the main process
                process.kill(processInfo.pid);
                // Kill any child processes
                process.kill(-processInfo.pid);
            } catch (error) {
                console.error(`💥 Failed to kill process ${processInfo.pid}:`, error);
            }
            activeProcesses.delete(projectId);
        }
    }

    static getProcess(projectId) {
        const processInfo = activeProcesses.get(projectId);
        return processInfo ? processInfo.process : null;
    }

    static listProcesses() {
        console.log('📊 Active processes:',
            Array.from(activeProcesses.entries())
                .map(([id, info]) => `${id}: ${info.pid}`)
        );
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
                .map(async (item) => {
                    return {
                        name: item.name,
                        path: path.join(projectsPath, item.name)
                    };
                })
        );

        // console.log("🎉 Final projects list:", projects);
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
    console.log("🎭 Time to put on our coding detective hat! Elementary, my dear Watson...");
    const { title, codebasePath } = req.body;

    try {
        const settings = await readSettings();
        const projectsPath = settings.projectsPath || path.join(process.cwd(), "projects");
        const templatePath = path.join(process.cwd(), "templates", "next-cloudflare");
        const newProjectPath = path.join(projectsPath, title);

        // First copy the template (same as prompt flow)
        console.log("📋 Copying template files...");
        await fs.cp(templatePath, newProjectPath, { recursive: true });
        res.write(`data: ${JSON.stringify({ type: 'log', message: '📋 Template copied successfully' })}\n\n`);

        // Now analyze the codebase and create tracker
        console.log(`📂 Analyzing codebase at: ${codebasePath}`);
        console.log("🔍 Elementary, my dear Watson! Let's deduce what this codebase is all about!");
        await analyzeProjectWithPTGen(codebasePath, newProjectPath);

        res.write(`data: ${JSON.stringify({ type: 'complete', path: newProjectPath })}\n\n`);
        res.end();
    } catch (error) {
        console.error("💥 Plot twist in our detective story:", error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
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
    console.log(`🚀 Mission Control: Initiating launch sequence for project ${projectId}`);
    console.log(`📜 Command received: ${command}`);

    try {
        // Check if project already has a running process
        if (ProcessManager.getProcess(projectId)) {
            console.log('⚠️ Houston, we have a problem: Server already running!');
            return res.status(400).json({
                error: 'A server is already running for this project'
            });
        }

        // Get project path
        const settings = await readSettings();
        const projectsPath = settings.projectsPath || path.join(process.cwd(), "projects");
        const projectPath = path.join(projectsPath, projectId);

        console.log('📍 Launch pad location:', projectPath);

        // Verify project directory exists
        try {
            await fs.access(projectPath);
            console.log('✅ Launch pad verified and ready');
        } catch (error) {
            console.error('💥 Launch pad not found:', error);
            return res.status(404).json({ error: 'Project directory not found' });
        }

        // Set up response for streaming
        console.log('📡 Establishing communication channel...');
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        const [cmd, ...args] = command.split(' ');
        console.log('🛠️ Preparing launch command:', { cmd, args, projectPath });

        let child;
        try {
            child = spawn(cmd, args, {
                cwd: projectPath,
                shell: true,
                env: { ...process.env, FORCE_COLOR: '1' },
                detached: true // Create new process group
            });

            if (!child.pid) {
                console.error('💥 Failed to spawn process - no PID assigned');
                throw new Error('Failed to start server process');
            }

            console.log('🎯 Process spawned successfully with PID:', child.pid);
            ProcessManager.addProcess(projectId, child);
        } catch (spawnError) {
            console.error('💥 Spawn failed:', spawnError);
            throw new Error(`Failed to start server: ${spawnError.message}`);
        }

        // Stream stdout
        child.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('📤 Server output:', output);

            if (output.includes('EADDRINUSE')) {
                console.log('🚫 Port conflict detected! Abort! Abort!');
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
            console.log('⚠️ Server warning/error:', error);

            if (error.includes('EADDRINUSE')) {
                console.log('🚫 Port conflict detected in stderr! Abort! Abort!');
                res.write('Error: Port is already in use. Please ensure no other server is running on this port.\n');
                ProcessManager.removeProcess(projectId);
                res.end();
                return;
            }
            res.write(error);
        });

        // Handle process completion
        child.on('close', (code) => {
            console.log(`🏁 Process completed with code ${code}`);
            res.write(`\nProcess exited with code ${code}`);
            ProcessManager.removeProcess(projectId);
            res.end();
        });

        // Cleanup on request close
        req.on('close', () => {
            console.log('🧹 Client disconnected, cleaning up...');
            ProcessManager.removeProcess(projectId);
        });

    } catch (error) {
        console.error('💥 Mission failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add cleanup route
router.delete('/server', (req, res) => {
    const { projectId } = req.body;
    console.log(`🛑 Attempting to stop server for project ${projectId}...`);

    try {
        const process = ProcessManager.getProcess(projectId);
        if (!process) {
            console.log('⚠️ No running process found for project:', projectId);
            return res.status(404).json({ error: 'No running server found' });
        }

        console.log(`🎯 Found process with PID ${process.pid}, stopping...`);
        ProcessManager.removeProcess(projectId);
        console.log('✅ Server stopped successfully');

        res.json({ success: true });
    } catch (error) {
        console.error('💥 Failed to stop server:', error);
        res.status(500).json({ error: error.message || 'Failed to stop server' });
    }
});

export { router as projectsRouter };
