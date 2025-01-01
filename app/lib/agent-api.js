import Anthropic from '@anthropic-ai/sdk';

export async function streamWithXMLProcessing(prompt, callbacks) {
    console.log("🤖 Agent API: Processing prompt with XML handling");
    const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    });

    try {
        const stream = await client.messages.stream({
            messages: [{ role: 'user', content: prompt }],
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8192,
        });

        for await (const chunk of stream) {
            if (chunk.type === 'text_delta') {
                console.log("📝 Received chunk:", chunk.text);
                await callbacks.onTag(chunk.text);
            }
        }
    } catch (error) {
        console.error("🚨 Agent API Error:", error);
        callbacks.onError(error);
    }
}