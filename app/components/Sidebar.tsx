'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../lib/config';

interface Project {
  name: string;
  path: string;
  hasSettings: boolean;
}

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/projects`);
      const data = await response.json() as { projects: Project[] };
      setProjects(data.projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  return (
    <motion.nav
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-dim)] p-4"
    >
      <div className="space-y-4">
        <Link
          href="/settings"
          className={`block p-3 rounded-lg transition-colors ${
            pathname === '/settings'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
          }`}
        >
          Settings
        </Link>

        <div>
          <div className="flex items-center">
            <Link
              href="/projects"
              className={`flex-grow p-3 rounded-lg transition-colors ${
                pathname === '/projects'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
              }`}
            >
              Projects
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              className="p-3 text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] rounded-lg"
            >
              <motion.span
                animate={{ rotate: isProjectsOpen ? 180 : 0 }}
              >
                ▼
              </motion.span>
            </motion.button>
          </div>

          <AnimatePresence>
            {isProjectsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 space-y-2 mt-2 overflow-hidden"
              >
                {projects?.length > 0 ? (
                  projects.map(project => (
                    project.hasSettings && (
                      <motion.div
                        key={project.path}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                      >
                        <Link
                          href={`/projects/${project.name}`}
                          className={`block p-3 rounded-lg transition-colors ${
                            pathname === `/projects/${project.name}`
                              ? 'bg-[var(--accent-secondary)] text-white'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
                          }`}
                        >
                          {project.name}
                        </Link>
                      </motion.div>
                    )
                  ))
                ) : (
                  <div className="text-[var(--text-secondary)] p-2">No projects found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}