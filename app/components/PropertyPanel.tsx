'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import SettingsPanel from './SettingsPanel';
import ProjectsList from './ProjectsList';
import ProjectPropertyPanel from './ProjectPropertyPanel';

export default function PropertyPanel() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="w-96 border-l border-[var(--border-dim)] bg-[var(--bg-secondary)]"
    >
      {pathname === '/settings' && <SettingsPanel />}
      {pathname === '/projects' && <ProjectsList />}
      {pathname?.startsWith('/projects/') && <ProjectPropertyPanel />}
    </motion.div>
  );
}