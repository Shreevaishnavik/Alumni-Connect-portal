import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  unreadCount$ = this.notificationService.unreadCount$;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.fetchNotifications();
    this.notificationService.loadUnreadCount();
  }

  fetchNotifications() {
    this.notificationService.getNotifications().subscribe(res => {
      this.notifications = res;
    });
  }

  markAllRead() {
    this.notificationService.markAllRead().subscribe(() => {
      this.fetchNotifications();
      this.notificationService.loadUnreadCount();
    });
  }

  markAsRead(id: string, currentlyRead: boolean) {
    if (currentlyRead) return;
    this.notificationService.markRead(id).subscribe(() => {
      this.fetchNotifications();
      this.notificationService.loadUnreadCount();
    });
  }
}
