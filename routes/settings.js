import { Router } from "express";
import { promises as fs } from "fs";
import * as path from "path";
import os from "os";

const router = Router();
const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

router.get("/", async (req, res) => {
    console.log(
        "🎯 Why do programmers prefer dark mode? Because light attracts bugs! Processing GET request..."
    );
    try {
        const settings = await readSettings();
        console.log(
            "📂 What's a file's favorite dance? The shuffle! Settings loaded:",
            settings
        );
        res.json({
            ...settings,
            os: os.platform(),
        });
        console.log("✈️ Why did the response fly? Because it was JSON!");
    } catch (error) {
        console.error(
            "🚨 What's a developer's favorite snack? Cookies! But we got an error:",
            error
        );
        res.status(500).json({ error: "Failed to read settings" });
    }
});

router.post("/", async (req, res) => {
    try {
        const currentSettings = await readSettings();
        const newSettings = {
            ...currentSettings,
            ...req.body,
            os: os.platform(), // Ensure OS is always current
        };

        await fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
        res.json(newSettings);
    } catch (error) {
        res.status(500).json({ error: "Failed to update settings" });
    }
});

async function readSettings() {
    console.log(
        "📚 Why don't programmers like nature? It has too many bugs! Reading settings file..."
    );
    try {
        const data = await fs.readFile(SETTINGS_FILE, "utf8");
        console.log(
            "🎭 What did the JSON file say? Parse me if you can! Raw data:",
            data
        );
        return JSON.parse(data);
    } catch (error) {
        console.log(
            "🆕 Why did the settings file feel lonely? Because it was empty! Creating default settings..."
        );
        const defaultSettings = {
            projectsPath: path.join(process.cwd(), "projects"),
            anthropicApiKey: "",
            geminiApiKey: "",
            openaiApiKey: "",
            os: os.platform(),
        };
        await fs.writeFile(
            SETTINGS_FILE,
            JSON.stringify(defaultSettings, null, 2)
        );
        return defaultSettings;
    }
}

export { router as settingsRouter, readSettings };
