'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '../lib/config';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-hot-toast';

interface Page {
    path: string;
    name: string;
}

interface CreatePageResponse {
    success: boolean;
    path: string;
    error?: string;
}

export default function PagesList() {
    const [pages, setPages] = useState<Page[]>([]);
    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    const [pageContent, setPageContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [deletingPage, setDeletingPage] = useState<string | null>(null);
    const params = useParams();
    const projectName = params.name as string;

    const fetchPages = async () => {
        try {
            console.log("📡 Sending signal to project API...");
            const response = await fetch(`${getApiBaseUrl()}/api/pages/${projectName}`);
            console.log("📥 Response received:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as { pages: Page[] };
            console.log("📦 Unpacked pages:", data.pages);
            setPages(data.pages);
        } catch (error) {
            console.error("💥 Mission failed successfully:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("🚀 Initiating project discovery sequence...");
        fetchPages();
    }, [projectName]);

    const fetchPageContent = async (pagePath: string) => {
        try {
            const response = await fetch(
                `${getApiBaseUrl()}/api/pages/${projectName}/content?pagePath=${encodeURIComponent(pagePath)}`
            );
            const data = await response.json() as { content: string };
            setPageContent(data.content);
            setSelectedPage(pagePath);
        } catch (error) {
            console.error('Failed to fetch page content:', error);
        }
    };

    const handleUpdatePage = async (pagePath: string, newContent: string) => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/api/pages/${projectName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pagePath,
                    content: newContent
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update page');
            }

            toast.success('Page updated successfully!');
        } catch (error) {
            console.error('Failed to update page:', error);
            toast.error('Failed to update page');
        }
    };

    const handleAddPage = async () => {
        const pageName = prompt('Enter page name (e.g., "about" or "dashboard/settings"):');
        if (!pageName) return;

        // Sanitize the page name: convert spaces and special characters to dashes
        const sanitizedPageName = pageName
            .toLowerCase()
            .replace(/[^a-z0-9\/]/g, '-') // Replace any non-alphanumeric character (except /) with dash
            .replace(/-+/g, '-')          // Replace multiple dashes with single dash
            .replace(/^-|-$/g, '');       // Remove leading/trailing dashes

        try {
            const response = await fetch(`${getApiBaseUrl()}/api/pages/${projectName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageName: sanitizedPageName }),
            });

            const data = await response.json() as CreatePageResponse;

            if (data.success) {
                toast.success('Page created successfully!');
                fetchPages();
            } else {
                throw new Error(data.error || 'Failed to create page');
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const handleDeletePage = async (pagePath: string) => {
        try {
            // Sanitize the path before sending
            const sanitizedPath = pagePath
                .toLowerCase()
                .replace(/[^a-z0-9\/]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            const response = await fetch(`${getApiBaseUrl()}/api/pages/${projectName}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pagePath: sanitizedPath }),
            });

            if (!response.ok) {
                const errorData = await response.json() as { error?: string };
                throw new Error(errorData.error || 'Failed to delete page');
            }

            toast.success('Page deleted successfully!');
            fetchPages();
        } catch (error) {
            console.error('Failed to delete page:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete page');
        } finally {
            setDeletingPage(null);
        }
    };

    if (isLoading) {
        return <div className="p-6 text-[var(--text-secondary)]">Loading pages...</div>;
    }

    if (selectedPage) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-[var(--border-dim)] flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPage(null)}
                        className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    >
                        ←
                    </motion.button>
                    <h3 className="font-medium text-[var(--text-primary)] truncate">
                        {selectedPage.replace(/^.*[\\\/]/, '')}
                    </h3>
                </div>
                <div className="flex-1 overflow-auto">
                    <SyntaxHighlighter
                        language="typescript"
                        style={atomDark}
                        customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            background: 'var(--bg-secondary)',
                            fontSize: '0.75rem',
                            lineHeight: '1.2',
                        }}
                        showLineNumbers
                        wrapLines={true}
                        wrapLongLines={true}
                        lineProps={{
                            style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' }
                        }}
                    >
                        {pageContent}
                    </SyntaxHighlighter>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.history.back()}
                    className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                >
                    ←
                </motion.button>
                <div className="flex justify-between items-center flex-1">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Project Pages</h2>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddPage}
                        className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white"
                    >
                        Add New Page
                    </motion.button>
                </div>
            </div>
            {pages.map((page) => (
                <motion.div
                    key={page.path}
                    whileHover={{ scale: deletingPage !== page.path ? 1.02 : 1 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${deletingPage === page.path
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-dim)]'
                        }`}
                >
                    <div className="flex justify-between items-start">
                        <div
                            className="flex-1"
                            onClick={() => !deletingPage && fetchPageContent(page.path)}
                        >
                            <h3 className="font-medium text-[var(--text-primary)]">{page.name}</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">{page.path}</p>
                        </div>
                        {deletingPage === page.path ? (
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDeletePage(page.path)}
                                    className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                                >
                                    Confirm
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setDeletingPage(null)}
                                    className="px-3 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setDeletingPage(page.path)}
                                className="p-2 rounded hover:bg-red-500/10 text-red-500"
                            >
                                🗑️
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
