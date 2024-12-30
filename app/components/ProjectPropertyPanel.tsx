'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface StructCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function ProjectPropertyPanel() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const structCards: StructCard[] = [
    {
      id: 'overview',
      title: 'Project Blueprint',
      description: `The architectural foundation of your project, from authentication flows to performance strategies.`,
      icon: '🏗️',
      color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20',
    },
    {
      id: 'validation',
      title: 'Health Check',
      description: `Real-time validation status and diagnostic insights for your project.`,
      icon: '🔍',
      color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20',
    },
    {
      id: 'context',
      title: 'Project Timeline',
      description: `Your project's journey, from inception through recent developments to current priorities.`,
      icon: '📅',
      color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20',
    },
    {
      id: 'pages',
      title: 'Page Architecture',
      description: `Blueprint of your application's pages, from layouts to runtime optimizations.`,
      icon: '📄',
      color: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20',
    },
    {
      id: 'components',
      title: 'Component Library',
      description: `Your reusable building blocks, complete with implementation details and best practices.`,
      icon: '🧩',
      color: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20',
    },
    {
      id: 'assets',
      title: 'Asset Registry',
      description: `Comprehensive catalog of your project's media and static resources.`,
      icon: '🖼️',
      color: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20',
    },
    {
      id: 'env',
      title: 'Environment Setup',
      description: `Configuration variables and runtime resources powering your application.`,
      icon: '⚙️',
      color: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20',
    },
    {
      id: 'storage',
      title: 'Data Architecture',
      description: `Your data storage patterns and access strategies.`,
      icon: '💾',
      color: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20',
    },
    {
      id: 'types',
      title: 'Type System',
      description: `TypeScript definitions ensuring type safety across your codebase.`,
      icon: '📐',
      color: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
    },
    {
      id: 'api',
      title: 'API Gateway',
      description: `Your application's interface specifications and endpoint documentation.`,
      icon: '🔌',
      color: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
    },
    {
      id: 'functions',
      title: 'Function Registry',
      description: `Core functionality implementations and their runtime characteristics.`,
      icon: '⚡',
      color: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20',
    },
    {
      id: 'tests',
      title: 'Test Suite',
      description: `Quality assurance scenarios and performance benchmarks.`,
      icon: '🧪',
      color: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20',
    },
    {
      id: 'changelog',
      title: 'Change History',
      description: `Chronological record of project evolution and architectural decisions.`,
      icon: '📚',
      color: 'bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/20',
    },
  ];

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="w-96 border-l border-[var(--border-dim)] bg-[var(--bg-secondary)] overflow-y-auto h-full"
    >
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Project Structure</h2>

        {structCards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border cursor-pointer ${card.color}`}
            onClick={() => setSelectedCard(card.id === selectedCard ? null : card.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{card.icon}</span>
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">{card.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{card.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}