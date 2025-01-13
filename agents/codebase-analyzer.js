export const codebaseTools = [
    {
        name: "drill_down",
        description: "Lists all files and folders in a specified directory path. Use this to explore the contents of a folder.",
        input_schema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The directory path to explore (e.g., 'src' or 'app/components')"
                }
            },
            required: ["path"]
        }
    },
    {
        name: "read_file",
        description: "Reads and returns the contents of a specified file. Use this to analyze source code, configuration files, or documentation.",
        input_schema: {
            type: "object",
            properties: {
                filepath: {
                    type: "string",
                    description: "The path to the file (e.g., 'package.json' or 'src/index.ts')"
                }
            },
            required: ["filepath"]
        }
    }
];

export const systemPrompt = `You are an expert software developer and codebase analyst. Your task is to thoroughly explore and document a codebase's structure, patterns, and key files.

When analyzing a codebase:
1. Start with configuration files (package.json, tsconfig.json, etc.) to understand the project setup
2. Explore source code directories systematically
3. Skip over node_modules, .git, build outputs, and dependency directories
4. Document important findings about each significant file
5. Build a mental map of the project architecture

You have access to two tools:
- drill_down: Lists contents of a directory
- read_file: Reads contents of a specific file

Be thorough but efficient - skip obviously irrelevant files/folders.`;

export const userPrePrompt = `I'm going to show you the root level files and folders of a codebase. Please analyze them and:
1. Identify which files/folders look important
2. Tell me which ones you want to explore further
3. Explain your reasoning for each choice

Here's the root level structure:`;

export const userPostPrompt = `Please analyze these files/folders and tell me your exploration plan. Format your response as:

<Analysis>
[Your analysis of what you see at this level]
</Analysis>

<ExplorationPlan>
[List of files you want to read and folders you want to drill into, in order of priority]
</ExplorationPlan>

End with <continue/> if you have more analysis to do.`;