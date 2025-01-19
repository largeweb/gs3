import { ChatAgent } from '../../lib/chat-agent';

export async function POST(req: Request) {
  const { message } = await req.json() as { message: string };
  const agent = new ChatAgent();
  await agent.initialize();

  const response = await agent.processMessage('session-1', message);

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}