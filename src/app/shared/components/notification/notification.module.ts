import { Component, Input, Pipe, PipeTransform, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { User } from 'src/app/core/models/user.model';
import { Notification } from 'src/app/core/services/notification.service';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class MockTimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MockTimeAgoPipe
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCenterComponent {
  @Input() user$!: Observable<User | null>;

  notifications: Notification[] = [
    { id: '1', title: 'New Article Approved', body: 'The editor approved your article "A Taste of Tailwind".', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', title: 'Welcome!', body: 'Thank you for joining CollabBlog.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
  
  readonly unreadNotificationsCount$: Observable<number>;

  constructor() {
    this.unreadNotificationsCount$ = this.user$?.pipe(
      map(() => this.notifications.filter(n => !n.read).length)
    ) ?? new Observable<number>(observer => { observer.next(this.notifications.filter(n => !n.read).length); });
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  trackById(index: number, notification: Notification): string {
    return notification.id;
  }
}
