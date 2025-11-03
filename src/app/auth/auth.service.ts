import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { User } from '../core/models/user.model';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  errors?: { [key: string]: string[] };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private readonly accessTokenKey = 'cb_access_token';
  private readonly refreshTokenKey = 'cb_refresh_token';
  private readonly userKey = 'cb_user_data';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = this.getAccessToken();

    // If there's no token, clear any existing user data
    if (!token) {
      this.clearUserData();
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decoded.exp && decoded.exp < currentTime) {
        this.clearUserData();
        return;
      }

      // Try to load user from localStorage first
      const savedUser = localStorage.getItem(this.userKey);
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          // Verify the user ID matches the token
          if (user.id === (decoded.sub || decoded.id)) {
            this.userSubject.next(user);
            return;
          }
        } catch {
          // If parsing fails, continue to create user from token
        }
      }

      // Create user from token data if no valid user in storage
      const user: User = {
        _id: decoded.sub || decoded.id,
        email: decoded.email || '',
        fullName: decoded.fullName || '',
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || '',
        role: decoded.role || 'guest',
        createdAt: decoded.createdAt || new Date().toISOString(),
        updatedAt: decoded.updatedAt || new Date().toISOString(),
      };

      this.saveUserToStorage(user);
      this.userSubject.next(user);
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearUserData();
    }
  }

  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${environment.apiUrl}/auth/register`, registerData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400 || error.status === 409) {
            // Return the error response for validation or conflict errors
            return throwError(() => error);
          }
          // For other errors, rethrow with a generic message
          return throwError(
            () => new Error('An error occurred during registration. Please try again later.'),
          );
        }),
      );
  }

  login(
    email: string,
    password: string,
  ): Observable<{ user: User; accessToken: string; refreshToken: string }> {
    // Clear any existing data before login
    this.clearUserData();

    return this.http
      .post<{
        success: boolean;
        message: string;
        data: {
          user: User;
          accessToken: string;
          refreshToken: string;
        };
      }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message);
          }

          const { user, accessToken, refreshToken } = response.data;

          // Update last login time
          const updatedUser = {
            ...user,
            lastLoginAt: new Date().toISOString(),
          };

          // Save tokens and user data
          this.setTokens(accessToken, refreshToken);
          this.saveUserToStorage(updatedUser);
          this.userSubject.next(updatedUser);

          return {
            user: updatedUser,
            accessToken,
            refreshToken,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          // Clear any partial data on error
          this.clearUserData();

          let errorMessage = 'An error occurred during login';
          if (error.status === 401) {
            errorMessage = 'Invalid email or password';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Invalid request';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.clearUserData();
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private saveUserToStorage(user: User): void {
    if (!user?._id) {
      console.error('Invalid user data provided for storage');
      return;
    }

    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
      // Don't throw here to prevent breaking the application flow
    }
  }

  private clearUserData(): void {
    // Clear the current user
    this.userSubject.next(null);

    // Clear tokens
    this.clearTokens();

    // Clear user data from storage
    localStorage.removeItem(this.userKey);

    // Force clear any session data
    localStorage.removeItem('savedEmail');

    // Clear any potential session storage
    sessionStorage.clear();

    // Ensure we're not in an auth route to prevent redirect loops
    if (!this.router.url.startsWith('/auth')) {
      this.router.navigate(['/auth/login']);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await firstValueFrom(
        this.http.post<{ accessToken: string; refreshToken: string }>(
          `${environment.apiUrl}${environment.refreshTokenKey || '/auth/refresh'}`,
          { refreshToken },
        ),
      );

      if (res?.accessToken && res?.refreshToken) {
        this.setTokens(res.accessToken, res.refreshToken);
        return true;
      }
      return false;
    } catch (error: unknown) {
      this.clearTokens();
      if (error instanceof Error) {
        console.error('Error refreshing token:', error.message);
      }
      return false;
    }
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  }

  hasRole(): boolean {
    const user = this.getCurrentUser();
    return Boolean(user?.role);
  }

  resetPassword(
    email: string,
    newPassword: string,
    token?: string,
  ): Observable<{ message: string }> {
    const payload = { email, newPassword };

    if (token) {
      return this.http.post<{ message: string }>(
        `${environment.apiUrl}/auth/reset-password/confirm`,
        { ...payload, token },
      );
    }

    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, {
      email,
    });
  }
}
