import Anthropic from '@anthropic-ai/sdk';
import { readSettings } from '../../routes/settings.js';
import { systemPrompt } from '../../agents/pt-generator.js';

// Example conversations showing proper format
const exampleConversations = [
    {
        role: "user",
        content: [{
            type: "text",
            text: "Generate a project tracker for a basic Next.js blog with Cloudflare integration"
        }]
    },
    {
        role: "assistant",
        content: [{
            type: "text",
            text: `<overview>
Architecture patterns:
- Next.js 13+ App Router
- Edge Runtime optimization
- Cloudflare Pages deployment
- KV for caching
- D1 for data storage

Backend integration:
- Serverless API routes
- Edge middleware
- Cloudflare Workers integration
</overview>

<error>
<value>no</value>
<description>
All architectural components are compatible with Cloudflare edge runtime.
No conflicts detected in the current specification.
</description>
</error>

<recent-history>
1. Long-term context:
- Project initiated Q1 2024
- Adopted App Router architecture
- Integrated Cloudflare services

2. Recent developments:
- Added MDX support
- Implemented image optimization
- Set up CI/CD pipeline

3. Current focus:
- Performance optimization
- SEO improvements
- Analytics integration
</recent-history>

<page>
<path>src/app/blog/[slug]/page.tsx</path>
<description>
Runtime: Server Component
Layout: BlogPostLayout
Components:
- MDXContent
- CommentSection
- ShareButtons

Data fetching:
- Static generation with ISR
- Cloudflare D1 for content
- KV for cache layer
</description>
</page>
...rest of tags following format...`
        }]
    },
    {
        role: "user",
        content: [{
            type: "text",
            text: "Continue the project tracker specification"
        }]
    },
    {
        role: "assistant",
        content: [{
            type: "text",
            text: `<component>
<path>src/components/MDXContent.tsx</path>
<description>
Purpose: Dynamic MDX rendering
Runtime: Client Component
Props interface: MDXContentProps
State: Local content state
Performance: Code splitting
Edge compatibility: Full
</description>
</component>

<asset>
<path>public/blog-images/*</path>
<description>
Type: Image assets
Format: WebP with JPEG fallback
Optimization: Cloudflare Polish
Loading: Lazy with blur placeholder
Accessibility: Alt text required
</description>
</asset>

<continue/>`
        }]
    }
];

export async function streamWithXMLProcessing(prompt, callbacks = []) {
    console.log("🔍 Detective Claude's Case File #" + Math.floor(Math.random() * 1000));
    console.log("📊 Evidence Analysis:");
    console.log(`  - Prompt Size: ${(Buffer.byteLength(prompt, 'utf8') / 1024).toFixed(2)}KB`);

    const settings = await readSettings();
    if (!settings.anthropicApiKey) {
        const errorMsg = "🚨 Missing API Key! Check settings.json";
        callbacks.onChunk(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        const client = new Anthropic({
            apiKey: settings.anthropicApiKey
        });

        console.log("🤖 Sending request to Claude...");

        const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 8192,
            temperature: 0,
            system: systemPrompt,
            messages: [
                ...exampleConversations,
                {
                    role: "user",
                    content: [{ type: "text", text: prompt }]
                }
            ]
        });

        console.log("🔍 Raw Claude Response:", JSON.stringify(response, null, 2));

        if (!response.content || !response.content[0]?.text) {
            throw new Error("Invalid response format from Claude");
        }

        const fullResponse = response.content[0].text;
        await callbacks.onChunk(fullResponse);
        return fullResponse;

    } catch (error) {
        console.error("🎭 Full Error Details:", error);
        callbacks.onError(error);
        throw error;
    }
}