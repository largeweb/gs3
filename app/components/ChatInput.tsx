'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const pathname = usePathname();

  const getPlaceholder = () => {
    switch (pathname) {
      case '/projects':
        return "✨ Browse projects or ask about project management capabilities";
      case '/settings':
        return "🛠️ Need help configuring? Ask about API keys, project paths, or best practices";
      default:
        if (pathname?.startsWith('/projects/')) {
          if (pathname.includes('/pages')) {
            return "🎨 Make frontend page changes - I'll analyze the impact across your project and suggest compatible solutions";
          }
          return "💡 Describe your change request - I'll analyze it against the Project Tracker and suggest compatible solutions";
        }
        return "How can I assist you today?";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement chat submission
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-[var(--border-dim)] p-4">
      <div className="max-w-4xl mx-auto flex gap-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={getPlaceholder()}
          className="flex-1 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white"
        >
          Send
        </motion.button>
      </div>
    </form>
  );
}