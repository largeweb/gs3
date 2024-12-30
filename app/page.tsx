'use client';

import { useState } from 'react';
import { getApiBaseUrl } from './lib/config';

export default function Home() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const executeCommand = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/fs/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json() as { output: string, error: string };

      if (data.error) {
        setError(data.error);
        setOutput('');
      } else {
        setOutput(data.output);
        setError('');
      }
    } catch (error) {
      console.error('Error:', error);
      return <div>Something went wrong</div>;
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl mb-4">File System Explorer</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command (ls, pwd, cd, dir)"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={executeCommand}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Execute
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {output && (
        <pre className="p-4 bg-gray-100 rounded overflow-auto">
          {output}
        </pre>
      )}
    </main>
  );
}
