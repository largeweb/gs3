import { Anthropic } from '@anthropic-ai/sdk';
import { readSettings } from '../routes/settings';
import { systemPrompt } from '../../agents/project-creator';

interface ChatSession {
  id: string;
  messages: Message[];
}

interface Message {
  role: 'user' | 'assistant';
  content: { type: 'text'; text: string }[];
}

export class ChatAgent {
  private client: Anthropic | null = null;
  private sessions: Map<string, ChatSession> = new Map();

  async initialize() {
    const settings = await readSettings();
    if (!settings.anthropicApiKey) {
      throw new Error('Missing Anthropic API key in settings');
    }

    this.client = new Anthropic({
      apiKey: settings.anthropicApiKey
    });
  }

  async processMessage(sessionId: string, userMessage: string) {
    if (!this.client) {
      await this.initialize();
    }

    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        messages: []
      };
      this.sessions.set(sessionId, session);
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    });

    try {
      const response = await this.client!.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 8192,
        temperature: 0,
        system: systemPrompt,
        messages: session.messages
      });

      // Add assistant response to session
      session.messages.push({
        role: 'assistant',
        content: response.content
      });

      return response;
    } catch (error) {
      console.error('Chat processing error:', error);
      throw error;
    }
  }

  getSessionHistory(sessionId: string): Message[] {
    return this.sessions.get(sessionId)?.messages || [];
  }
}