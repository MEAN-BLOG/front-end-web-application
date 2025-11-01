import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { io, Socket } from 'socket.io-client';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';

/**
 * Represents a notification object.
 */
export interface Notification {
  _id: string;
  id: string;
  userId: string;
  type: string;
  message: string;
  title?: string;
  body?: string;
  referenceId?: string;
  referenceModel?: string;
  read: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  metadata?: any;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private socket!: Socket;
  private readonly _notifications$ = new BehaviorSubject<Notification[]>([]);
  readonly notifications$: Observable<Notification[]> = this._notifications$.asObservable();
  private readonly _hasUnread$ = new BehaviorSubject<boolean>(false);

  private readonly socketUrl = environment.socketUrl;
  private readonly user: User | null;

  /**
   * Constructor for NotificationService.
   * Initializes socket connection and retrieves the current user.
   * @param auth - AuthService instance to handle authentication-related tasks.
   * @param http - HttpClient instance to make HTTP requests.
   * @param snackBar - MatSnackBar instance to show notifications in the UI.
   */
  constructor(
    private readonly auth: AuthService,
    private readonly http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.connect();
    this.user = this.auth.getCurrentUser();
  }

  /**
   * Connects to the socket server and listens for events.
   * This method sets up socket event listeners for connect, disconnect,
   * new notifications, and reconnect events.
   */
  private connect(): void {
    this.socket = io(this.socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      if (this.user?._id) {
        this.joinRoom(this.user._id);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[NotificationService] ⚠️ Disconnected:', reason);
    });

    this.socket.io.on('reconnect', (attempt) => {
      if (this.user?._id) this.joinRoom(this.user._id);
    });

    this.socket.on('new_notification', (data: any) => {
      const notification: Notification = this.mapNotification(data);
      this.showSnackBar(notification);
      this.refreshNotifications();
      this._hasUnread$.next(true);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[NotificationService] ❌ Connection error:', err.message);
    });
  }

    /** Mark notifications as read */
  markAsReadReal(): void {
    this._hasUnread$.next(false);
  }
  /**
   * Maps the incoming data to a Notification object.
   * @param data - The raw notification data from the server.
   * @returns A formatted Notification object.
   */
  private mapNotification(data: any): Notification {
    return {
      _id: data.id || data._id?.toString(),
      id: data.id || data._id?.toString(),
      userId: data.userId?.toString() || data.userId,
      type: data.type,
      message: data.message,
      title: this.extractTitle(data),
      body: data.message,
      referenceId: data.referenceId?.toString(),
      referenceModel: data.referenceModel,
      read: data.read,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      metadata: data.metadata,
    };
  }

  /**
   * Extracts the title from the notification data.
   * @param data - The raw notification data from the server.
   * @returns The title of the notification.
   */
  private extractTitle(data: any): string {
    if (data.title) return data.title;
    const match = data.message?.match(/on title: (.+)$/);
    return match ? match[1] : data.type || 'Notification';
  }

  /**
   * Displays a snackbar notification with the message from the new notification.
   * @param notification - The new notification to be shown.
   */
  private showSnackBar(notification: Notification): void {
    this.snackBar.open(notification.message, 'Close', {
      duration: 5000,
      panelClass: 'snackbar-toast',
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Joins the notification room for the user using their userId.
   * @param userId - The userId of the current user.
   */
  private joinRoom(userId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join', userId);
    }
  }

  /**
   * Fetches notifications from the API.
   * @param page - The page number for pagination (defaults to 1).
   * @param limit - The number of notifications per page (defaults to 10).
   * @returns An Observable with the notifications data and pagination info.
   */
  getNotifications(page: number = 1, limit: number = 10): Observable<{ data: Notification[], pagination: any }> {
    const url = `${environment.apiUrl}/notifications?page=${page}&limit=${limit}`;
    return this.http.get<{ data: Notification[], pagination: any }>(url, this.getAuthHeaders());
  }

  /**
   * Refreshes the notifications list by fetching it from the API.
   * @param page - The page number for pagination (defaults to 1).
   * @param limit - The number of notifications per page (defaults to 10).
   */
  refreshNotifications(page: number = 1, limit: number = 10): void {
    this.getNotifications(page, limit).subscribe({
      next: (response) => {
        this._notifications$.next(response.data);
      },
      error: (error) => {
        console.error('[NotificationService] Error fetching notifications:', error);
      }
    });
  }

  /**
   * Marks a notification as read.
   * @param notificationId - The ID of the notification to be marked as read.
   */
  markAsRead(notificationId: string): void {
    this._notifications$.getValue().map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.http.patch(`${environment.apiUrl}/notifications/${notificationId}`, {}, this.getAuthHeaders()).subscribe();
  }

  /**
   * Returns the authentication headers for API requests.
   * @returns The headers required for authenticated API requests.
   * @throws Will throw an error if the token is not available.
   */
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.auth.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  /**
   * Cleans up the socket connection when the service is destroyed.
   */
  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
