// In development: VITE_API_URL is set in react-app/.env to http://localhost:5000
// In production (Render): VITE_API_URL is set in the Render environment variables
// Fallback to '' means same-origin (works when backend serves the React build)
const API_BASE = import.meta.env.VITE_API_URL ?? '';
export default API_BASE;
