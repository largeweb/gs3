export const API_CONFIG = {
    // Edge runtime config (for frontend routes)
    EDGE: {
      runtime: 'edge',
      port: 3000
    },
    // Node.js runtime config (for backend processing)
    NODE: {
      runtime: 'nodejs',
      port: 3001
    },
    // Development environment detection
    isDev: process.env.NODE_ENV === 'development'
  };

  // Helper to determine correct API base URL
  export const getApiBaseUrl = () => {
    console.log("🎯 Why did the API URL feel confident? Because it had all the endpoints! Returning:", process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  };

  // Runtime type guard
  export const isEdgeRuntime = () => {
    return process.env.NEXT_RUNTIME === 'edge';
  };
