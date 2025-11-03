import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../core/models/user.model';
import { NotificationCenterComponent } from '../notification/notification.module';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    NotificationCenterComponent,
  ],
  templateUrl: './navbar.component.html',
})

/**
 * NavbarComponent
 *
 * Top-level navigation bar displayed across the application.
 * Shows authentication state, main navigation actions, mobile menu toggle,
 * and notification center entry.
 *
 * Responsibilities:
 * - Observe current authenticated user
 * - Provide logout action
 * - Toggle mobile menu on small viewports
 * - Apply compact UI style on scroll
 *
 * @component
 */
export class NavbarComponent implements OnInit {
  readonly user$: Observable<User | null>;
  readonly currentUser: User | null;

  isScrolled = false;
  isMobileMenuOpen = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {
    this.user$ = this.auth.user$;
    this.currentUser = this.auth.getCurrentUser();
  }
  /**
   * Lifecycle hook — initializes scroll state.
   */
  ngOnInit(): void {
    this.checkScroll();
  }

  /**
   * Handler executed on window scroll.
   * Updates UI flag to apply scrolled navbar style.
   */
  @HostListener('window:scroll', [])
  checkScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  /**
   * Toggle the mobile menu open/closed.
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Close the mobile menu — used typically after route navigation.
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * Sign out the current user and redirect to login page.
   */
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Utility to check if current user has a given role.
   *
   * @param role - Role name to compare against (e.g. `'admin'`)
   * @returns Observable<boolean> whether current user has provided role
   */
  hasRole(role: string): Observable<boolean> {
    return this.user$.pipe(map((user) => user?.role === role));
  }
}
