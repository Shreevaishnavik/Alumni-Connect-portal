import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';

  constructor() {
    // Read optional token from URL
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
