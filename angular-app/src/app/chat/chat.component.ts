import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, Message } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  userId!: string;
  currentUserId: string | null = null;
  messageText = '';
  messages$ = this.chatService.messages$;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private auth: AuthService,
    private router: Router
  ) {
    this.currentUserId = this.auth.getCurrentUserId();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
      this.chatService.loadHistory(this.userId).subscribe(res => {
        this.chatService.setMessages(res.messages || []);
      });
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (e) {}
  }

  sendMessage() {
    if (!this.messageText.trim()) return;
    this.chatService.sendMessage(this.userId, this.messageText);
    this.messageText = '';
  }

  goBack() {
    this.router.navigate(['/connections']);
  }
}
