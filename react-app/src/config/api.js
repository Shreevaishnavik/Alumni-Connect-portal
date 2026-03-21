// Backend API base URL
// Dev: VITE_API_URL=http://localhost:5000 in react-app/.env
// Prod (Render): VITE_API_URL= (empty string) in .env.production
//   → API_BASE becomes '' → relative URLs like /api/users/login work same-origin
// IMPORTANT: must use ?? not || so empty string is preserved for production
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

// Angular chat app URL
// Dev: http://localhost:4200
// Prod: /chat-app (served by Express at /chat-app path — same origin, no env var needed)
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const ANGULAR_URL = import.meta.env.VITE_ANGULAR_URL
  || (isLocalDev ? 'http://localhost:4200' : '/chat-app');

export { ANGULAR_URL };
export default API_BASE;
