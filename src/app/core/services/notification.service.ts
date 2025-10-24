import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private socket: Socket | undefined;
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor(private readonly auth: AuthService) {
    this.init();
  }

  private init() {
    this.socket = io(environment.socketUrl, { path: '/socket.io' });

    this.socket.on('connect', () => {
      const user = this.auth.getCurrentUser();
      if (user) {
        this.socket?.emit('notifications:subscribe', { userId: user._id });
      }
    });

    this.socket.on('notification', (payload: Notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([payload, ...current]);
    });
  }

  markRead(id: string) {
    const updated = this.notificationsSubject.value.map(n => 
      n.id === id ? { ...n, read: true } : n  
    );
    this.notificationsSubject.next(updated);
  }

  // Add this method to ensure proper cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
