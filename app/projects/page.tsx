'use client';

import { motion } from 'framer-motion';

export default function ProjectsPage() {
  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
          Project Chat Hub
        </h1>

        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Welcome to your Project Chat Hub
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">
            This is your central location for interacting with all your projects. Select a project from the sidebar to:
          </p>
          <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
            <li>Chat about specific project files and codebase</li>
            <li>Get AI-powered code suggestions and explanations</li>
            <li>Manage project settings and configurations</li>
            <li>Generate documentation and code snippets</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              🤖 AI Models
            </h3>
            <div className="space-y-2">
              <label className="block text-[var(--text-secondary)]">
                <input type="radio" name="model" className="mr-2" defaultChecked />
                Anthropic Claude
              </label>
              <label className="block text-[var(--text-secondary)]">
                <input type="radio" name="model" className="mr-2" />
                Google Gemini
              </label>
              <label className="block text-[var(--text-secondary)]">
                <input type="radio" name="model" className="mr-2" />
                OpenAI GPT-4
              </label>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              🎯 Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="block w-full text-left p-2 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]">
                📝 Generate Project Documentation
              </button>
              <button className="block w-full text-left p-2 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]">
                🔍 Analyze Code Quality
              </button>
              <button className="block w-full text-left p-2 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]">
                🚀 Suggest Optimizations
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
