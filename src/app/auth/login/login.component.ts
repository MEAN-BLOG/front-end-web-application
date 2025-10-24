import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../auth.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

declare const globalThis: Window;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  hidePassword = true;
  loading = false;
  error: string | null = null;
  private readonly subscriptions = new Subscription();
  returnUrl: string = '/';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar
  ) {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.returnUrl = returnUrl ? returnUrl.toString() : '/';
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Check for saved email/remember me
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.form.patchValue({
        email: savedEmail
      });
    }

    // Clear any existing auth errors
    this.error = null;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.form.value;

    // Save email to localStorage for convenience
    if (email) {
      localStorage.setItem('savedEmail', email);
    }

    this.subscriptions.add(
      this.authService.login(email, password).pipe(
        finalize(() => {
          this.loading = false;
        })
      ).subscribe({
        next: (response) => {
          this.snackBar.open('Login successful!', 'Dismiss', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Navigate to return URL or home
          const targetUrl = this.returnUrl || '/';
          this.router.navigateByUrl(targetUrl).then(() => {
            // Reload to ensure all app state is properly initialized
            globalThis.location.reload();
          });
        },
        error: (error: Error) => {
          this.error = error.message || 'An error occurred during login';
          this.snackBar.open(this.error, 'Dismiss', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      })
    );
  }

  // Social login functionality has been removed
}
