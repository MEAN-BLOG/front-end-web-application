import { Component, OnInit, HostListener } from '@angular/core'; // <-- Added OnInit and HostListener
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
export class NavbarComponent implements OnInit {
  readonly user$: Observable<User | null>;
  readonly currentUser: User | null;
  readonly unreadNotificationsCount$: Observable<number>;
  notifications: Notification[] = [
    { id: '1', title: 'New Article Approved', body: 'The editor approved your article "A Taste of Tailwind".', read: false, createdAt: new Date(Date.now() - 3600000) },
    { id: '2', title: 'Welcome!', body: 'Thank you for joining CollabBlog.', read: true, createdAt: new Date(Date.now() - 86400000) },
  ];
  
  isScrolled = false;
  isMobileMenuOpen = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.user$ = this.auth.user$;
    this.currentUser = this.auth.getCurrentUser();
    this.unreadNotificationsCount$ = this.user$.pipe(
      map(() => this.notifications.filter(n => !n.read).length) // Count unread notifications
    );
  }

  ngOnInit(): void {
    this.checkScroll(); 
  }

  @HostListener('window:scroll', [])
  checkScroll(): void {
    this.isScrolled = window.scrollY > 50; 
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  search(): void {
    console.log('Search functionality executed.');
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  hasRole(role: string): Observable<boolean> {
    return this.user$.pipe(
      map(user => user?.role === role)
    );
  }
}