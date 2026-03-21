import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface Message {
  senderId: string;
  text: string;
  timestamp: Date | string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messageSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messageSubject.asObservable();

  constructor(private auth: AuthService, private http: HttpClient) {
    // Use the dynamic backend URL (set by AuthService from URL params → localStorage)
    const backendUrl = this.auth.getBackendUrl();

    this.socket = io(backendUrl, {
      auth: { token: this.auth.getToken() }
    });

    const userId = this.auth.getCurrentUserId();
    if (userId) this.socket.emit('join', userId);

    fromEvent<Message>(this.socket, 'receive-message').subscribe(msg => {
      const current = this.messageSubject.getValue();
      this.messageSubject.next([...current, msg]);
    });
  }

  loadHistory(otherUserId: string): Observable<any> {
    return this.http.get(`${this.auth.apiUrl}/messages/${otherUserId}`,
      { headers: this.auth.getHeaders() });
  }

  getConversations(): Observable<any> {
    return this.http.get(`${this.auth.apiUrl}/messages/conversations/list`,
      { headers: this.auth.getHeaders() });
  }

  sendMessage(toUserId: string, text: string): void {
    const senderId = this.auth.getCurrentUserId();
    if (!senderId) return;

    this.socket.emit('send-message', { to: toUserId, text, senderId });

    this.http.post(`${this.auth.apiUrl}/messages/${toUserId}`, { text },
      { headers: this.auth.getHeaders() }).subscribe();

    const current = this.messageSubject.getValue();
    this.messageSubject.next([...current, { text, senderId, timestamp: new Date() }]);
  }

  setMessages(messages: Message[]): void {
    this.messageSubject.next(messages);
  }
}
