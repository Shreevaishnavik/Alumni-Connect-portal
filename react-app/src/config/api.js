// Backend API base URL
// Dev: set VITE_API_URL=http://localhost:5000 in react-app/.env
// Prod: empty string = same-origin (Express serves the React build)
const API_BASE = import.meta.env.VITE_API_URL ?? '';

// Angular chat app URL
// Dev: VITE_ANGULAR_URL=http://localhost:4200 in react-app/.env
// Prod: set VITE_ANGULAR_URL to your Angular Render Static Site URL in Render dashboard
const ANGULAR_URL = import.meta.env.VITE_ANGULAR_URL || 'http://localhost:4200';

export { ANGULAR_URL };
export default API_BASE;
