import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { AuthService, RegisterRequest } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';

// Custom validator for password complexity
export function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  
  const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
  
  if (!valid) {
    return { 
      passwordComplexity: {
        hasUpperCase,
        hasLowerCase,
        hasNumeric,
        hasSpecial
      }
    };
  }
  return null;
}

// Custom validator for password match
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    if (confirmPassword?.errors?.['mismatch']) {
      delete confirmPassword.errors['mismatch'];
      confirmPassword.updateValueAndValidity();
    }
    return null;
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  private subscription: Subscription = new Subscription();
  formSubmitted = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: passwordMatchValidator
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.error = null;

    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.loading = true;
    
    const { firstName, lastName, email, password } = this.registerForm.value;
    
    this.subscription = this.authService.register({ 
      firstName, 
      lastName, 
      email, 
      password 
    }).subscribe({
      next: () => {
        this.snackBar.open('Registration successful! Please check your email to verify your account.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/auth/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.handleRegistrationError(error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private handleRegistrationError(error: HttpErrorResponse): void {
    this.loading = false;
    
    if (error.status === 400 && error.error?.errors) {
      // Handle validation errors
      const errorMessages: string[] = [];
      const errors = error.error.errors;
      
      Object.keys(errors).forEach(key => {
        if (Array.isArray(errors[key])) {
          errorMessages.push(...errors[key]);
        }
      });
      
      this.error = errorMessages.join(' ');
    } else if (error.status === 409) {
      this.error = 'An account with this email already exists. Please use a different email or sign in.';
    } else {
      this.error = 'An error occurred during registration. Please try again later.';
    }
    
    this.snackBar.open(this.error, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper methods for template
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  getPasswordError(): string {
    if (this.password?.hasError('required')) {
      return 'Password is required';
    }
    if (this.password?.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    if (this.password?.hasError('passwordComplexity')) {
      const issues = [];
      const complexity = this.password.errors?.['passwordComplexity'];
      
      if (!complexity.hasUpperCase) issues.push('one uppercase letter');
      if (!complexity.hasLowerCase) issues.push('one lowercase letter');
      if (!complexity.hasNumeric) issues.push('one number');
      if (!complexity.hasSpecial) issues.push('one special character');
      
      return `Password must contain at least ${issues.join(', ')}`;
    }
    return '';
  }
}