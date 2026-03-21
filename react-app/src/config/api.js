// Backend API base URL
// Dev: reads VITE_API_URL from react-app/.env → http://localhost:5000
// Prod (Render): VITE_API_URL must be set to your Render service URL in Render dashboard
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Angular chat app URL
// Dev: http://localhost:4200 (Angular dev server)
// Prod: /chat-app  (served by the same Express server at /chat-app path)
// No VITE_ANGULAR_URL env var needed on Render — same-origin path works automatically.
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const ANGULAR_URL = import.meta.env.VITE_ANGULAR_URL
  || (isLocalDev ? 'http://localhost:4200' : '/chat-app');

export { ANGULAR_URL };
export default API_BASE;
