import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  unreadCount = 0;
  userRole: string | null = null;
  reactBase = 'http://localhost:5173';

  constructor(
    private notificationService: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.notificationService.loadUnreadCount();

    // Decode role from JWT so we can show/hide role-specific nav links
    const token = this.auth.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRole = payload.role;
      } catch { this.userRole = null; }
    }
  }
}
