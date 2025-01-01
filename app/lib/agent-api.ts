import Anthropic from '@anthropic-ai/sdk';
import { processXMLChunk } from './xml-stream';

interface StreamOptions {
    onTag: (tag: string) => void;
    onError?: (error: Error) => void;
}

export async function streamWithXMLProcessing(
    prompt: string,
    options: StreamOptions
) {
    const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    });

    let buffer = '';

    try {
        await client.messages.stream({
            messages: [{ role: 'user', content: prompt }],
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4096,
        }).on('text', (text) => {
            const { completedTags, buffer: newBuffer } = processXMLChunk(text, buffer);
            buffer = newBuffer;

            // Process each completed tag
            completedTags.forEach(tag => {
                options.onTag(tag);
            });
        });

        // Process any remaining complete tags in buffer
        if (buffer) {
            const { completedTags } = processXMLChunk(buffer);
            completedTags.forEach(tag => {
                options.onTag(tag);
            });
        }
    } catch (error) {
        if (options.onError) {
            options.onError(error as Error);
        }
    }
}