import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl: string;

  constructor() {
    // Read optional token/userId/backendUrl passed via URL query params from the React app
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken   = urlParams.get('token');
    const urlUserId  = urlParams.get('userId');
    const urlBackend = urlParams.get('backendUrl');

    if (urlToken && urlUserId) {
      localStorage.setItem('token', urlToken);
      localStorage.setItem('userId', urlUserId);
    }
    // Store the backend URL if provided via URL param.
    // Reject Vite dev server URLs (port 5173) — those are a past bug where
    // API_BASE was empty string and window.location.origin (Vite) leaked in.
    if (urlBackend && !urlBackend.includes('5173')) {
      localStorage.setItem('backendUrl', urlBackend);
    } else if (urlBackend && urlBackend.includes('5173')) {
      // Clear the bad value so the correct fallback is used
      localStorage.removeItem('backendUrl');
    }


    const savedBackend = localStorage.getItem('backendUrl');
    const defaultBackend = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : window.location.origin; // fallback: same origin (only works if Angular and backend are co-hosted)

    this.apiUrl = (savedBackend || defaultBackend) + '/api';
  }

  getBackendUrl(): string {
    const saved = localStorage.getItem('backendUrl');
    return saved || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
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
