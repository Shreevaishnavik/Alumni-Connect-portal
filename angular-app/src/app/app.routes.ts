import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ConnectionsComponent } from './connections/connections.component';
import { NotificationsComponent } from './notifications/notifications.component';

export const routes: Routes = [
  { path: '', redirectTo: '/connections', pathMatch: 'full' },
  { path: 'connections', component: ConnectionsComponent },
  { path: 'chat/:userId', component: ChatComponent },
  { path: 'notifications', component: NotificationsComponent },
];
