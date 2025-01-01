interface XMLStreamResult {
    completedTags: string[];
    buffer: string;
}

export function processXMLChunk(chunk: string, previousBuffer: string = ''): XMLStreamResult {
    const buffer = previousBuffer + chunk;
    const completedTags: string[] = [];
    let remainingBuffer = buffer;

    // Regular expression to match complete top-level XML tags
    const tagRegex = /<([^>]+)>([^<]*(?:(?!<\/\1>)<[^>]*>[^<]*)*)<\/\1>/g;

    let match;
    let lastIndex = 0;

    while ((match = tagRegex.exec(buffer)) !== null) {
        const fullTag = match[0];
        const tagStart = match.index;
        const tagEnd = tagStart + fullTag.length;

        // Only process if it's a top-level tag (no complete parent tags before it)
        const textBefore = buffer.substring(0, tagStart);
        const openTags = (textBefore.match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (textBefore.match(/<\/[^>]*>/g) || []).length;

        if (openTags === closeTags) {
            completedTags.push(fullTag);
            lastIndex = tagEnd;
        }
    }

    // Keep the remaining incomplete XML in the buffer
    remainingBuffer = buffer.substring(lastIndex);

    return {
        completedTags,
        buffer: remainingBuffer
    };
}