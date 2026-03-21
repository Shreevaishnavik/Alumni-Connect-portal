import { Injectable } from '@angular/core';

// Determine the backend URL:
// - In production (Render): frontend and backend are on the same domain, use same origin
// - Locally: backend is on localhost:5000
const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin;

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl = `${BACKEND_URL}/api`;

  constructor() {
    // Read optional token/userId passed via URL query params from the React app
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlUserId = urlParams.get('userId');

    if (urlToken && urlUserId) {
      localStorage.setItem('token', urlToken);
      localStorage.setItem('userId', urlUserId);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getHeaders() {
    return { Authorization: `Bearer ${this.getToken()}` };
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return localStorage.getItem('userId');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch { return localStorage.getItem('userId'); }
  }
}
