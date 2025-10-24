import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User, LoginCredentials, RegisterData, LoginResponse, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly jwtHelper: JwtHelperService;
  
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'cb_access_token';
  private readonly REFRESH_TOKEN_KEY = 'cb_refresh_token';
  
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() {
    this.jwtHelper = new JwtHelperService();
    this.initializeAuthState();
  }
  
  private initializeAuthState(): void {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token) as { [key: string]: any };
      if (decodedToken) {
        const user: User = {
          _id: decodedToken['userId'] || '',
          firstName: decodedToken['firstName'] || '',
          lastName: decodedToken['lastName'] || '',
          email: decodedToken['email'] || '',
          role: (decodedToken['role'] as UserRole) || 'guest',
          fullName: decodedToken['fullName'] || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.currentUserSubject.next(user);
      }
    } else {
      this.clearAuthData();
    }
  }
  
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.setAuthData(response.data);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          throw error;
        }
      })
    );
  }
  
  register(userData: RegisterData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/register`, userData).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthData(response.data);
        }
      })
    );
  }
  
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }
  
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Gets the current user's role
   * @returns The current user's role or null if not authenticated
   */
  getUserRole(): UserRole | null {
    const user = this.currentUserSubject.value;
    return user?.role || null;
  }
  
  private setAuthData(authData: LoginResponse['data']): void {
    localStorage.setItem(this.TOKEN_KEY, authData.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
    this.currentUserSubject.next(authData.user);
  }
  
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  hasRole(role: User['role']): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }
}
