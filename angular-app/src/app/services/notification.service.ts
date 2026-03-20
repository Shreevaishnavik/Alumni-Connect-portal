import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:5000/api';
  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {}

  loadUnreadCount(): void {
    this.http.get<{count: number}>(`${this.apiUrl}/notify/unread-count`,
      { headers: this.auth.getHeaders() })
      .subscribe(res => this.unreadCount.next(res.count));
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notify`, { headers: this.auth.getHeaders() });
  }

  markAllRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notify/read-all`, {},
      { headers: this.auth.getHeaders() });
  }

  markRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notify/${id}/read`, {},
      { headers: this.auth.getHeaders() });
  }
}
