'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '../lib/config';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Page {
    path: string;
    name: string;
}

export default function PagesList() {
    const [pages, setPages] = useState<Page[]>([]);
    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    const [pageContent, setPageContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const projectName = params.name as string;

    useEffect(() => {
        console.log("🚀 Initiating project discovery sequence...");

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
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Project Pages</h2>
            {pages.map((page) => (
                <motion.div
                    key={page.path}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] cursor-pointer"
                    onClick={() => fetchPageContent(page.path)}
                >
                    <h3 className="font-medium text-[var(--text-primary)]">{page.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{page.path}</p>
                </motion.div>
            ))}
        </div>
    );
}
