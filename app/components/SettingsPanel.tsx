'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '../lib/config';

interface Settings {
  projectsPath: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  userOS: string;
}

// Extend the global Window interface
declare global {
  interface Window {
    showDirectoryPicker(): Promise<{
      name: string;
      kind: 'directory';
    }>;
  }
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    projectsPath: '',
    anthropicApiKey: '',
    geminiApiKey: '',
    openaiApiKey: '',
    userOS: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 Why did the developer go broke? Because he used up all his cache! Fetching settings...");
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log("🌐 Houston, we're attempting a settings fetch!");
      const baseUrl = getApiBaseUrl();
      console.log("🌍 Base URL located:", baseUrl);

      const response = await fetch(`${baseUrl}/api/settings`);
      console.log("📡 Response received! Status:", response.status);

      if (!response.ok) {
        console.error("🚨 Server responded with:", response.status);
        const errorText = await response.text();
        console.error("📄 Error details:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as Settings;
      console.log("📦 Unpacked settings data:", data);
      setSettings(data);
    } catch (error) {
      console.error("💥 Operation failed! The error laughed and said:", error);
      toast.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedSettings = await response.json() as Settings;
      setSettings(updatedSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleBrowse = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const path = dirHandle.name;
      setSettings(prev => ({ ...prev, projectsPath: path }));
    } catch (error) {
      console.error('Failed to browse:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-96 bg-[var(--bg-secondary)] h-full border-l border-[var(--border-dim)] p-6">
      <h1 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Settings</h1>

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <div className="flex gap-2">
              <input
                type={key.includes('ApiKey') ? 'password' : 'text'}
                value={value}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                disabled={key === 'userOS'}
                className="flex-1 p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] text-[var(--text-primary)]"
              />
              {key === 'projectsPath' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBrowse}
                  className="px-3 py-2 rounded-lg bg-[var(--accent-secondary)] text-white"
                >
                  Browse
                </motion.button>
              )}
            </div>
          </div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={updateSettings}
          className="w-full p-3 rounded-lg bg-[var(--accent-primary)] text-white mt-6"
        >
          Update Settings
        </motion.button>
      </div>
    </div>
  );
}
