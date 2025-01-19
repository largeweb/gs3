'use client';

import { useState, useEffect } from 'react';
import { ChatAgent } from '../lib/chat-agent';
import { ChatWithCards } from '../components/ChatWithCards';

export default function SettingsPage() {
  const [chatAgent] = useState(() => new ChatAgent());
  const [sessionId] = useState(() => 'settings-' + Date.now());

  useEffect(() => {
    chatAgent.initialize().catch(console.error);
  }, [chatAgent]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <ChatWithCards
          sessionId={sessionId}
          chatAgent={chatAgent}
          initialMessage="What can you do?"
        />
      </div>
    </div>
  );
}