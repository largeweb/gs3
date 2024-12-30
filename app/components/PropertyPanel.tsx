'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import SettingsPanel from './SettingsPanel';
import ProjectsList from './ProjectsList';
import ProjectPropertyPanel from './ProjectPropertyPanel';
import PagesList from './PagesList';

export default function PropertyPanel() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="w-[32rem] border-l border-[var(--border-dim)] bg-[var(--bg-secondary)] overflow-y-auto h-full"
    >
      {pathname === '/settings' && <SettingsPanel />}
      {pathname === '/projects' && <ProjectsList />}
      {pathname?.includes('/pages') && <PagesList />}
      {pathname?.startsWith('/projects/') && !pathname?.includes('/pages') && <ProjectPropertyPanel />}
    </motion.div>
  );
}