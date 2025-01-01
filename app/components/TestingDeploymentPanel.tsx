'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '../lib/config';

interface TerminalOutput {
    message: string;
    type: 'info' | 'error' | 'success';
    timestamp: number;
}

interface ServerError extends Error {
    message: string;
}

interface TestingDeploymentPanelProps {
    onBack: () => void;
}

export default function TestingDeploymentPanel({ onBack }: TestingDeploymentPanelProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<TerminalOutput[]>([]);

    const startServer = async (type: 'dev' | 'preview') => {
        setIsRunning(true);
        setLogs([{
            message: `Starting ${type} server...`,
            type: 'info',
            timestamp: Date.now()
        }]);

        try {
            const response = await fetch(`${getApiBaseUrl()}/api/projects/server`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: type === 'dev' ? 'npm run dev' : 'npm run preview',
                    projectId: window.location.pathname.split('/')[2]
                })
            });

            const reader = response.body?.getReader();
            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                setLogs(prev => [...prev, {
                    message: text,
                    type: text.toLowerCase().includes('error') ? 'error' : 'info',
                    timestamp: Date.now()
                }]);
            }
        } catch (error: unknown) {
            const serverError = error as ServerError;
            setLogs(prev => [...prev, {
                message: `Failed to start server: ${serverError.message}`,
                type: 'error',
                timestamp: Date.now()
            }]);
        }
    };

    const stopServer = async () => {
        try {
            await fetch(`${getApiBaseUrl()}/api/projects/server`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: window.location.pathname.split('/')[2]
                })
            });
            setIsRunning(false);
            setLogs(prev => [...prev, {
                message: 'Server stopped',
                type: 'info',
                timestamp: Date.now()
            }]);
        } catch (error: unknown) {
            const serverError = error as ServerError;
            setLogs(prev => [...prev, {
                message: `Failed to stop server: ${serverError.message}`,
                type: 'error',
                timestamp: Date.now()
            }]);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="text-[var(--text-secondary)]"
                >
                    ← Back
                </motion.button>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Testing & Deployment</h2>
            </div>

            <div className="flex gap-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startServer('dev')}
                    disabled={isRunning}
                    className="flex-1 p-3 rounded-lg bg-[var(--accent-primary)] text-white disabled:opacity-50"
                >
                    Start Dev Server
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startServer('preview')}
                    disabled={isRunning}
                    className="flex-1 p-3 rounded-lg bg-[var(--accent-secondary)] text-white disabled:opacity-50"
                >
                    Start Preview Server
                </motion.button>
            </div>

            {isRunning && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={stopServer}
                    className="w-full p-3 rounded-lg bg-red-500 text-white"
                >
                    Stop Server
                </motion.button>
            )}

            <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg h-[400px] overflow-y-auto font-mono">
                {logs.map((log, i) => (
                    <div
                        key={i}
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
    );
}