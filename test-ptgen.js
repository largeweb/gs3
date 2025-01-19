import readline from 'readline';
import { streamWithXMLProcessing } from './app/lib/agent-api.js';
import { systemPrompt } from './agents/pt-generator.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runTest() {
    console.log("🚀 PTGen Test Script");
    console.log("-------------------");

    try {
        const prompt = await new Promise((resolve) => {
            rl.question('Enter your prompt (or press enter for default): ', (answer) => {
                resolve(answer || 'Generate a project tracker for a new Next.js project with Cloudflare integration.');
            });
        });

        console.log("\n📝 Using prompt:", prompt);
        console.log("🤖 Generating project tracker...\n");

        const response = await streamWithXMLProcessing(prompt, {
            onChunk: (text) => {
                // Clear previous line and write new content
                process.stdout.write('\x1b[2K\r');
                process.stdout.write(text);
            },
            onError: (error) => {
                console.error("\n❌ Error:", error.message);
            }
        });

        console.log("\n\n✅ Generation complete!");
        console.log("📊 Response length:", response.length, "characters");
        console.log("🔍 XML tags found:", (response.match(/<\/?[^>]+(>|$)/g) || []).length);

    } catch (error) {
        console.error("\n💥 Test failed:", error);
    } finally {
        rl.close();
    }
}

runTest();