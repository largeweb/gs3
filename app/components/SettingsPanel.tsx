'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '../lib/config';

interface Settings {
  projectPath: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  userOS: string;
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    projectPath: '',
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

      // Reload the page after successful update
      window.location.reload();
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
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
            <input
              type={key.includes('ApiKey') ? 'password' : 'text'}
              value={value}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              disabled={key === 'userOS'}
              className="w-full p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-dim)] text-[var(--text-primary)]"
            />
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
