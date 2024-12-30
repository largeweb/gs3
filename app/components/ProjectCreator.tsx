'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '../lib/config';
import { useRouter } from 'next/navigation';

type SoftwareType = 'next-cloudflare' | 'nodejs-aws' | 'nodejs-lambda' | 'gpu-aws' | 'gpu-modal';
type ReferenceType = 'prompt' | 'pdf' | 'codebase';

interface ProjectCreationLogs {
    message: string;
    type: 'info' | 'error' | 'success';
    timestamp: number;
}

interface ProjectCreatorProps {
    onBack: () => void;
}

interface ProjectCreateResponse {
    success: boolean;
    path: string;
    logs: {
        stdout: string;
        stderr: string;
    };
    message?: string;
}

const SUCCESS_MESSAGE = '✨ Project setup complete! Ready to go!';

export default function ProjectCreator({ onBack }: ProjectCreatorProps) {
    const [title, setTitle] = useState('');
    const [softwareType, setSoftwareType] = useState<SoftwareType>('next-cloudflare');
    const [referenceType, setReferenceType] = useState<ReferenceType>('prompt');
    const [prompt, setPrompt] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [logs, setLogs] = useState<ProjectCreationLogs[]>([]);
    const router = useRouter();

    const formatTitle = (title: string) => {
        return title.toLowerCase().replace(/\s+/g, '-');
    };

    const addLog = (message: string, type: ProjectCreationLogs['type'] = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
    };

    const handleCreate = async () => {
        setIsCreating(true);
        addLog('Starting project creation...');

        try {
            const response = await fetch(`${getApiBaseUrl()}/api/projects/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formatTitle(title),
                    softwareType,
                    referenceType,
                    prompt: referenceType === 'prompt' ? prompt : null,
                }),
            });

            const data = await response.json() as ProjectCreateResponse;

            if (response.ok) {
                addLog('Project structure created successfully', 'success');
                addLog('Installing dependencies...', 'info');

                if (data.logs.stdout) {
                    data.logs.stdout.split('\n')
                        .filter(line => line.trim())
                        .forEach(line => addLog(line, 'info'));
                }

                if (data.logs.stderr) {
                    data.logs.stderr.split('\n')
                        .filter(line => line.trim())
                        .forEach(line => addLog(line, 'info'));
                }

                addLog(SUCCESS_MESSAGE, 'success');
            } else {
                throw new Error(data.message || 'Failed to create project');
            }
        } catch (error) {
            if (error instanceof Error) {
                addLog(`Error: ${error.message}`, 'error');
            } else {
                addLog('An unknown error occurred', 'error');
            }
        } finally {
            setIsCreating(false);
        }
    };

    const isSuccessful = logs.some(log =>
        log.message === SUCCESS_MESSAGE &&
        log.type === 'success'
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="text-[var(--text-secondary)]"
                >
                    ← Back
                </motion.button>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Create New Project</h2>
            </div>

            <div className="space-y-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Project Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] text-[var(--text-primary)]"
                            placeholder="Enter project title"
                        />
                        {title && (
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Project ID: {formatTitle(title)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Software Type
                        </label>
                        <select
                            value={softwareType}
                            onChange={(e) => setSoftwareType(e.target.value as SoftwareType)}
                            className="w-full p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] text-[var(--text-primary)]"
                        >
                            <option value="next-cloudflare">Cloudflare Next App</option>
                            <option value="nodejs-aws">AWS Tiny EC2 Server</option>
                            <option value="gpu-aws">AWS GPU EC2 Server</option>
                            <option value="nodejs-lambda">AWS Lambda (NodeJS Worker)</option>
                            <option value="gpu-modal">GPU Modal (GPU Worker)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Reference Type
                        </label>
                        <select
                            value={referenceType}
                            onChange={(e) => setReferenceType(e.target.value as ReferenceType)}
                            className="w-full p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] text-[var(--text-primary)]"
                        >
                            <option value="prompt">Prompt</option>
                            <option value="pdf">PDF</option>
                            <option value="codebase">Codebase</option>
                        </select>
                    </div>

                    {referenceType === 'prompt' && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                Project Description
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] text-[var(--text-primary)] h-32"
                                placeholder="Describe your project..."
                            />
                        </div>
                    )}
                </div>

                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)]">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Creation Log</h3>
                    <div className="space-y-1 font-mono text-xs max-h-60 overflow-y-auto">
                        {logs.map((log) => (
                            <div
                                key={log.timestamp}
                                className={`${log.type === 'error' ? 'text-red-500' :
                                    log.type === 'success' ? 'text-green-500' :
                                        'text-[var(--text-secondary)]'
                                    }`}
                            >
                                {log.message}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    {!isSuccessful ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCreate}
                            disabled={isCreating || !title}
                            className="w-full p-3 rounded-lg bg-[var(--accent-primary)] text-white disabled:opacity-50"
                        >
                            {isCreating ? 'Creating Project...' : 'Create Project'}
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/projects/${formatTitle(title)}`)}
                            className="w-full p-3 rounded-lg bg-[var(--accent-primary)] text-white"
                        >
                            Go to Project
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
