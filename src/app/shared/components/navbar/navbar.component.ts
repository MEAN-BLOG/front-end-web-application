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
import { NotificationCenterComponent } from '../notification/notification.module';

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
    TimeAgoPipe,
    NotificationCenterComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  readonly user$: Observable<User | null>;
  readonly currentUser: User | null;
  
  isScrolled = false;
  isMobileMenuOpen = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.user$ = this.auth.user$;
    this.currentUser = this.auth.getCurrentUser();
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

  hasRole(role: string): Observable<boolean> {
    return this.user$.pipe(
      map(user => user?.role === role)
    );
  }
}