const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Backend API base URL - Bulletproof Resolution
let API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  API_BASE = isLocalDev ? 'http://localhost:5000' : '';
}

// Strip trailing slash if present to avoid '//api/users/login' which causes 404s
if (API_BASE && API_BASE.endsWith('/')) {
  API_BASE = API_BASE.slice(0, -1);
}

// Angular chat app URL
const ANGULAR_URL = import.meta.env.VITE_ANGULAR_URL
  || (isLocalDev ? 'http://localhost:4200' : '/chat-app');

export { ANGULAR_URL };
export default API_BASE;
