import { codebaseAnalysisPrompt } from '../agents/codebase-analyzer.js';

export async function analyzeCodebase(codebasePath) {
    console.log("🔍 Starting codebase analysis workflow...");

    const prompt = `${codebaseAnalysisPrompt}

Analyze the codebase located at: ${codebasePath}

Focus on:
- Project architecture and structure
- Key components and their relationships
- Dependencies and external integrations
- Potential improvements and optimizations`;

    return prompt;
}