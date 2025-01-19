import { promises as fs } from 'fs';
import path from 'path';
import { streamWithXMLProcessing } from '../app/lib/agent-api.js';
import { systemPrompt } from '../agents/pt-generator.js';

export async function analyzeProjectWithPTGen(projectPath, templatePath) {
    console.log("🚀 Mission Control: Project Analysis Sequence Initiated!");
    console.log(`📂 Target Location: ${projectPath}`);

    try {
        const prompt = `${systemPrompt}
        Generate a project tracker for a new Next.js project with Cloudflare integration.`;

        console.log("📝 Sending prompt to Claude...");

        const response = await streamWithXMLProcessing(prompt, {
            onChunk: (text) => {
                console.log("📄 Received response from Claude:", text);
            },
            onError: (error) => {
                console.error("❌ Error:", error.message);
                throw error;
            }
        });

        if (!response) {
            throw new Error("No content generated from analysis");
        }

        await saveProjectTracker(projectPath, response);
        return response;
    } catch (error) {
        console.error("💥 Analysis failed:", error);
        throw error;
    }
}

async function copyTemplate(templatePath, projectPath) {
    await fs.cp(templatePath, projectPath, { recursive: true });
}

async function readCodebase(projectPath) {
    const files = [];

    async function scanDir(dirPath) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await scanDir(fullPath);
                }
            } else {
                const content = await fs.readFile(fullPath, 'utf-8');
                files.push({
                    path: path.relative(projectPath, fullPath),
                    content
                });
            }
        }
    }

    await scanDir(projectPath);
    return files;
}

function generateAnalysisPrompt(files) {
    return `${systemPrompt}

Analyze the following codebase:

${files.map(file => `
File: ${file.path}
\`\`\`
${file.content}
\`\`\`
`).join('\n')}

Generate a complete project tracker specification for this codebase.`;
}

async function saveProjectTracker(projectPath, trackerContent) {
    const trackerPath = path.join(projectPath, 'gs3-tracker.xml');
    await fs.writeFile(trackerPath, trackerContent, 'utf-8');
    console.log("💾 Saved project tracker to:", trackerPath);
}