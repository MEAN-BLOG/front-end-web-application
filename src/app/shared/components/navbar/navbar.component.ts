import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../auth/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { User } from '../../../core/models/user.model';

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    TimeAgoPipe
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  readonly user$: Observable<User | null>;
  readonly currentUser : User| null;
  readonly unreadNotificationsCount$: Observable<number>;
  notifications: Notification[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.user$ = this.auth.user$;
    this.currentUser = this.auth.getCurrentUser();
    this.unreadNotificationsCount$ = new Observable<number>(subscriber => {
      subscriber.next(0);
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  search(): void {
    console.log('Search functionality to be implemented');
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  hasRole(role: string): Observable<boolean> {
    return this.user$.pipe(
      map(user => Boolean(user?.role))
    );
  }
}
