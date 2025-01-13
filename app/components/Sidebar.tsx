'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../lib/config';
import { ChevronDown } from 'lucide-react';

interface DataStore {
  id: 'kv' | 'r2' | 'd1';
  name: string;
  icon: string;
  description: string;
}

interface Project {
  name: string;
  path: string;
  hasSettings: boolean;
  dataStores?: DataStore[];
}

const dataStoreOptions: DataStore[] = [
  {
    id: 'kv',
    name: 'Key-Value Store',
    icon: '🔑',
    description: 'JSON metadata storage'
  },
  {
    id: 'r2',
    name: 'R2 Storage',
    icon: '📦',
    description: 'Large file storage'
  },
  {
    id: 'd1',
    name: 'D1 Database',
    icon: '💾',
    description: 'SQL tables'
  }
];

const projectStructure = [
  {
    id: 'testing-deployment',
    name: 'Testing & Deployment',
    icon: '🚀'
  },
  {
    id: 'pages',
    name: 'Page Architecture',
    icon: '📄'
  },
  {
    id: 'components',
    name: 'Component Library',
    icon: '🧩'
  },
  {
    id: 'data-stores',
    name: 'Data Stores',
    icon: '💾'
  }
];

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [openProjectStructure, setOpenProjectStructure] = useState<string | null>(null);
  const [openDataStores, setOpenDataStores] = useState<string | null>(null);
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

  const isProjectStructureActive = (projectName: string, structureId: string) => {
    return pathname === `/projects/${projectName}/${structureId}`;
  };

  const isDataStoreActive = (projectName: string, storeId: string) => {
    return pathname === `/projects/${projectName}/data-stores/${storeId}`;
  };

  const DropdownIcon = ({ isOpen }: { isOpen: boolean }) => (
    <motion.div
      initial={false}
      animate={{ rotate: isOpen ? 90 : 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="text-[var(--text-secondary)]"
    >
      <ChevronDown
        size={18}
        className="transform -rotate-90"
      />
    </motion.div>
  );

  return (
    <motion.nav
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-[24rem] bg-[var(--bg-secondary)] border-r border-[var(--border-dim)] p-4"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)]"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="GenSaaS3 Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-tertiary)] [-webkit-background-clip:text] [-moz-background-clip:text] [background-clip:text] text-transparent">
                GenSaaS3
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[var(--accent-tertiary)]">Build</span>
                <span className="text-xs text-[var(--text-secondary)]">•</span>
                <span className="text-xs text-[var(--accent-secondary)]">Deploy</span>
                <span className="text-xs text-[var(--text-secondary)]">•</span>
                <span className="text-xs text-[var(--accent-primary)]">Scale</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-2">
          <Link
            href="/settings"
            className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${pathname === '/settings'
              ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20'
              : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'
              }`}
          >
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </Link>

          <div className="space-y-2">
            <div className="flex items-center">
              <Link
                href="/projects"
                className={`flex items-center gap-3 flex-grow p-4 rounded-lg transition-all duration-200 ${pathname === '/projects'
                  ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'
                  }`}
              >
                <span className="text-lg">📂</span>
                <span>Projects</span>
              </Link>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                className="p-3 text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] rounded-lg"
              >
                <DropdownIcon isOpen={isProjectsOpen} />
              </motion.button>
            </div>

            <AnimatePresence>
              {isProjectsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-4 space-y-2 overflow-hidden"
                >
                  {projects?.map(project => (
                    project.hasSettings && (
                      <motion.div key={project.path} className="space-y-2">
                        <div className="flex items-center">
                          <Link
                            href={`/projects/${project.name}`}
                            className={`flex items-center gap-3 flex-grow p-3 rounded-lg transition-all duration-200 ${pathname.startsWith(`/projects/${project.name}`)
                              ? 'bg-[var(--accent-secondary)] text-white shadow-lg shadow-[var(--accent-secondary)]/20'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'
                              }`}
                          >
                            <span className="text-lg">📱</span>
                            <span>{project.name}</span>
                          </Link>
                          {pathname.startsWith(`/projects/${project.name}`) && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setOpenProjectStructure(openProjectStructure === project.name ? null : project.name)}
                              className="p-3 text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] rounded-lg"
                            >
                              <DropdownIcon isOpen={openProjectStructure === project.name} />
                            </motion.button>
                          )}
                        </div>

                        <AnimatePresence>
                          {pathname.startsWith(`/projects/${project.name}`) && openProjectStructure === project.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 space-y-2"
                            >
                              {projectStructure.map(structure => (
                                <div key={structure.id}>
                                  {structure.id === 'data-stores' ? (
                                    <>
                                      <div className="flex items-center">
                                        <div
                                          className={`flex items-center gap-3 flex-grow p-3 rounded-lg cursor-pointer transition-all duration-200 ${pathname.includes(`/projects/${project.name}/data-stores`)
                                            ? 'bg-[var(--accent-secondary)] text-white shadow-lg shadow-[var(--accent-secondary)]/20'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'
                                            }`}
                                        >
                                          <span className="text-lg">{structure.icon}</span>
                                          <span>{structure.name}</span>
                                        </div>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => setOpenDataStores(openDataStores === project.name ? null : project.name)}
                                          className="p-3 text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] rounded-lg"
                                        >
                                          <DropdownIcon isOpen={openDataStores === project.name} />
                                        </motion.button>
                                      </div>

                                      <AnimatePresence>
                                        {openDataStores === project.name && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="ml-4 space-y-2"
                                          >
                                            {dataStoreOptions.map(store => (
                                              <Link
                                                key={store.id}
                                                href={`/projects/${project.name}/data-stores/${store.id}`}
                                                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isDataStoreActive(project.name, store.id)
                                                  ? 'bg-[var(--accent-secondary)] text-white shadow-lg shadow-[var(--accent-secondary)]/20'
                                                  : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'
                                                  }`}
                                              >
                                                <span className="text-lg">{store.icon}</span>
                                                <span>{store.name}</span>
                                              </Link>
                                            ))}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </>
                                  ) : (
                                    <Link
                                      href={`/projects/${project.name}/${structure.id}`}
                                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isProjectStructureActive(project.name, structure.id)
                                        ? 'bg-[var(--accent-secondary)] text-white shadow-lg shadow-[var(--accent-secondary)]/20'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'
                                        }`}
                                    >
                                      <span className="text-lg">{structure.icon}</span>
                                      <span>{structure.name}</span>
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}