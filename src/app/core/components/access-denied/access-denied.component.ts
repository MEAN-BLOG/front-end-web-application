import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Component displayed when a user tries to access a page they do not have permission for.
 * Provides options to go back home or log in if not authenticated.
 */
@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './access-denied.component.html'
})
export class AccessDeniedComponent implements OnInit {
  /** Message describing the reason for access denial */
  errorMessage = 'You do not have permission to access this page.';

  /** The URL the user originally attempted to access */
  returnUrl: string | null = null;

  /** Indicates if the user is logged in */
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Initializes component and reads query parameters for returnUrl, message, and login status.
   */
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnUrl');
      const message = params.get('message');
      if (message) {
        this.errorMessage = message;
      }
      this.isLoggedIn = params.get('isLoggedIn') === 'true';
    });
  }

  /**
   * Navigates the user to the home page.
   */
  goToHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigates the user to the login page, preserving the returnUrl.
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: this.returnUrl || '/' } 
    });
  }
}
