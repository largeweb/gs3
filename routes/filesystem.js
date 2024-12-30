import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";

const execAsync = promisify(exec);
const router = Router();

router.post("/execute", async (req, res) => {
    const { command } = req.body;

    // Basic security: only allow certain commands
    const allowedCommands = ["ls", "pwd", "cd", "dir"];
    const baseCommand = command.split(" ")[0];

    if (!allowedCommands.includes(baseCommand)) {
        return res.status(400).json({ error: "Command not allowed" });
    }

    try {
        const { stdout, stderr } = await execAsync(command);
        res.json({
            output: stdout,
            error: stderr,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export { router as fileSystemRouter };
