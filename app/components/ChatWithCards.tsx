import { useState, useEffect } from 'react';
import { XMLParser } from 'fast-xml-parser';
import { ChatAgent } from '../lib/chat-agent';
import ChatInput from './ChatInput';

interface CardData {
  type: 'Analysis' | 'ProjectCreation' | 'ChangeRequest' | 'TodoList' | 'Error';
  content: any;
  color: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  cards?: CardData[];
}

interface ChatWithCardsProps {
  sessionId: string;
  chatAgent: ChatAgent;
  initialMessage?: string;
}

export function ChatWithCards({ sessionId, chatAgent, initialMessage }: ChatWithCardsProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  const xmlParser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true
  });

  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
    // Load existing session history
    const history = chatAgent.getSessionHistory(sessionId);
    setMessages(history);
  }, [sessionId, initialMessage]);

  const handleSendMessage = async (message: string) => {
    try {
      // Add user message immediately
      setMessages(prev => [...prev, {
        role: 'user',
        content: message
      }]);

      const response = await chatAgent.processMessage(sessionId, message);
      const assistantMessage = response.content[0].text;

      // Add assistant message with extracted cards
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage,
        cards: extractCards(assistantMessage)
      }]);
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  };

  const extractCards = (text: string): CardData[] => {
    const cards: CardData[] = [];
    const cardTypes = {
      'Analysis': '🟪 purple',
      'ProjectCreation': '🟦 blue',
      'ChangeRequest': '🟩 green',
      'TodoList': '🟨 yellow',
      'Error': '🟥 red'
    };

    Object.keys(cardTypes).forEach(type => {
      const regex = new RegExp(`<${type}[^>]*>([\\s\\S]*?)<\/${type}>`, 'g');
      let match;

      while ((match = regex.exec(text)) !== null) {
        try {
          cards.push({
            type: type as keyof typeof cardTypes,
            content: xmlParser.parse(match[0]),
            color: cardTypes[type as keyof typeof cardTypes]
          });
        } catch (error) {
          console.error(`Failed to parse ${type} card:`, error);
        }
      }
    });

    return cards;
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case '🟪 purple': return 'bg-purple-500 text-white';
      case '🟦 blue': return 'bg-blue-500 text-white';
      case '🟩 green': return 'bg-green-500 text-white';
      case '🟨 yellow': return 'bg-yellow-500 text-white';
      case '🟥 red': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === 'assistant' ? 'ml-4' : 'mr-4'}`}>
            <div className="chat-message">{msg.content}</div>
            {msg.cards && (
              <div className="flex gap-2 mt-2">
                {msg.cards.map((card, j) => (
                  <button
                    key={j}
                    onClick={() => setActiveCard(card)}
                    className={`p-2 rounded ${getColorClass(card.color)}`}
                  >
                    {card.type}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
      {activeCard && (
        <div className="w-80 border-l p-4">
          <CardDetail card={activeCard} onClose={() => setActiveCard(null)} />
        </div>
      )}
    </div>
  );
}