'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '../lib/config';

interface Project {
  name: string;
  path: string;
  hasSettings: boolean;
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("🚀 Initiating project discovery sequence...");
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      console.log("📡 Sending signal to project API...");
      const response = await fetch(`${getApiBaseUrl()}/api/projects`);
      console.log("📥 Response received:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { projects: Project[] };
      console.log("📦 Unpacked projects:", data.projects);
      setProjects(data.projects);
      setError(null);
    } catch (error) {
      console.error("💥 Mission failed successfully:", error);
      setError("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading projects...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Projects</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white"
        >
          Create New Project
        </motion.button>
      </div>

      <div className="space-y-4">
        {projects.map(project => (
          project.hasSettings && (
            <motion.div
              key={project.path}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] cursor-pointer"
              onClick={() => router.push(`/projects/${project.name}`)}
            >
              <h3 className="text-lg font-medium text-[var(--text-primary)]">
                {project.name}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {project.path}
              </p>
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}