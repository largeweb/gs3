'use client';

import { motion } from 'framer-motion';

export default function ProjectPageClient() {
  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Project Change Request System
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Submit your change request below. The system will:
          </p>
          <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
            <li>Analyze request against current Project Tracker structure</li>
            <li>Validate API integrations and runtime compatibility</li>
            <li>Generate tracker diffs for proposed changes</li>
            <li>Prepare code modifications based on approved changes</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}