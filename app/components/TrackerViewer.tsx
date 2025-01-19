'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getApiBaseUrl } from '../lib/config';

export default function TrackerViewer() {
    const [tracker, setTracker] = useState<any>(null);
    const params = useParams();
    const projectName = params.name as string;

    useEffect(() => {
        fetch(`${getApiBaseUrl()}/api/projects/${projectName}/tracker`)
            .then(res => res.json())
            .then(data => setTracker(data));
    }, [projectName]);

    if (!tracker) return <div>Loading tracker...</div>;

    return (
        <pre className="p-4 overflow-auto">
            {JSON.stringify(tracker, null, 2)}
        </pre>
    );
}