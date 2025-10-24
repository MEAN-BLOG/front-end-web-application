import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="access-denied-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Access Denied</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>{{ errorMessage }}</p>
          <p *ngIf="returnUrl">You were trying to access: <code>{{ returnUrl }}</code></p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="goToHome()">Go to Home</button>
          <button mat-button (click)="goToLogin()" *ngIf="!isLoggedIn">Log In</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      padding: 20px;
    }
    mat-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    mat-card-actions {
      justify-content: center;
      gap: 10px;
    }
  `]
})
export class AccessDeniedComponent implements OnInit {
  errorMessage = 'You do not have permission to access this page.';
  returnUrl: string | null = null;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnUrl');
      const message = params.get('message');
      if (message) {
        this.errorMessage = message;
      }
      this.isLoggedIn = params.get('isLoggedIn') === 'true';
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToLogin() {
    this.router.navigate(['/auth/login'], { 
      queryParams: { 
        returnUrl: this.returnUrl || '/'
      } 
    });
  }
}
