import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";

const execAsync = promisify(exec);
const router = Router();

router.post("/execute", async (req, res) => {
    console.log("🎮 Command center activated! Incoming command:", req.body.command);
    const { command } = req.body;

    // Basic security: only allow certain commands
    const allowedCommands = ["ls", "pwd", "cd", "dir"];
    const baseCommand = command.split(" ")[0];

    if (!allowedCommands.includes(baseCommand)) {
        console.log("🚫 Nice try, hackerman! Command not in the VIP list");
        return res.status(400).json({ error: "Command not allowed" });
    }

    try {
        console.log("🚀 Executing command in 3... 2... 1...");
        const { stdout, stderr } = await execAsync(command);
        console.log("✨ Command executed successfully! Output length:", stdout.length);
        res.json({
            output: stdout,
            error: stderr,
        });
    } catch (error) {
        console.error("💥 Houston, we have a problem:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export { router as fileSystemRouter };
