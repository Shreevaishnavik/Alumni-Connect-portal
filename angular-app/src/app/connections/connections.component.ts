import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connections.component.html'
})
export class ConnectionsComponent implements OnInit {
  conversations: any[] = [];
  pendingRequests: any[] = [];
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private chatService: ChatService,
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.chatService.getConversations().subscribe(res => {
      this.conversations = res;
    });

    this.http.get<any>(`${this.apiUrl}/users/me`, { headers: this.auth.getHeaders() }).subscribe(res => {
      if (res && res.connectionRequests) {
        this.pendingRequests = res.connectionRequests.filter((r: any) => r.status === 'pending');
      }
    });
  }

  getOtherParticipant(participants: any[]) {
    const currentId = this.auth.getCurrentUserId();
    return participants.find(p => p._id !== currentId) || {};
  }

  openChat(conversation: any) {
    const other = this.getOtherParticipant(conversation.participants);
    if (other._id) {
      this.router.navigate(['/chat', other._id]);
    }
  }

  acceptRequest(requesterId: string) {
    this.http.put(`${this.apiUrl}/users/connect/${requesterId}/accept`, {}, { headers: this.auth.getHeaders() })
      .subscribe(() => {
        this.pendingRequests = this.pendingRequests.filter(r => r.from._id !== requesterId);
        alert('Accepted request');
      });
  }
}
