'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import SettingsPanel from './SettingsPanel';
import ProjectsList from './ProjectsList';
import ProjectPropertyPanel from './ProjectPropertyPanel';
import PagesList from './PagesList';
import TestingDeploymentPanel from './TestingDeploymentPanel';

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
      {pathname?.includes('/testing-deployment') && <TestingDeploymentPanel onBack={() => { }} />}
      {pathname?.startsWith('/projects/') &&
        !pathname?.includes('/pages') &&
        !pathname?.includes('/testing-deployment') &&
        <ProjectPropertyPanel />}
    </motion.div>
  );
}