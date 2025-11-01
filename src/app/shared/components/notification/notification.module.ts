import {
  Component,
  Input,
  Pipe,
  PipeTransform,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { User } from 'src/app/core/models/user.model';
import { Notification, NotificationService } from './notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Pipe to display a "time ago" format for timestamps.
 */
@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class MockTimeAgoPipe implements PipeTransform {
  /**
   * Transforms a timestamp to a human-readable "time ago" format.
   * 
   * @param value The timestamp to convert (can be Date, string, or number).
   * @returns A string representing the time ago in a human-readable format.
   */
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

/**
 * Notification center component to manage and display user notifications.
 */
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
    MockTimeAgoPipe,
    MatSnackBarModule
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  @Input() user$!: Observable<User | null>;

  notifications: Notification[] = [];
  unreadCount: number = 0;
  hasNewRealtimeNotif: boolean = false;
  private sub!: Subscription;
  /**
   * Constructs the NotificationCenterComponent.
   * 
   * @param notificationService - The NotificationService to handle fetching and updating notifications
   * @param cdr - The ChangeDetectorRef to trigger change detection for OnPush strategy
   */
  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  /**
   * On initialization, fetch notifications and subscribe to real-time updates.
   */
  ngOnInit(): void {
    this.notificationService.getNotifications(1, 100).subscribe({
      next: (response) => {
        this.notifications = response.data;
        this.unreadCount = this.notifications.filter((n) => !n.read).length;
        this.hasNewRealtimeNotif = this.unreadCount > 0;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('[NotificationCenter] Error fetching notifications:', error);
      },
    });

    this.sub = this.notificationService.notifications$.subscribe((list) => {
      this.notifications = list;
      this.unreadCount = list.filter((n) => !n.read).length;
      this.cdr.markForCheck();
    });
  }

  /**
   * Cleanup by unsubscribing from the real-time notification subscription when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /**
   * Marks all unread notifications as read.
   */
  markAllAsRead(): void {
    this.notifications.forEach((n) => {
      if (!n.read) this.notificationService.markAsRead(n.id);
    });
  }

    onNotificationClick(): void {
    this.notificationService.markAsReadReal();
  }
  /**
   * Marks a specific notification as read.
   * 
   * @param notificationId - The ID of the notification to mark as read
   */
  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  /**
   * Handles the event of viewing the details of a notification.
   * Navigates to the blog post and scrolls to the specific comment or reply.
   * 
   * @param notification - The notification object to view details for
   */
  viewNotificationDetails(notification: Notification): void {
    const articleId = notification.metadata?.articleId;
    const referenceId = notification?.referenceId;
    this.markAsRead(notification._id);
    this.notificationService.refreshNotifications(1, 100);
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    this.hasNewRealtimeNotif = this.unreadCount > 0;
    this.cdr.markForCheck();
    if (articleId && referenceId) {
      const navigationExtras: NavigationExtras = {
        queryParams: { referenceId },
      };

      this.router.navigate([`/blog/${articleId}`], navigationExtras);
    } else {
      console.warn('[NotificationCenter] Missing articleId or referenceId in notification.');
    }
  }
}
