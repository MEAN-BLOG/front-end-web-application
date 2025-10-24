// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UserRole } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    data: User[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      throw new Error('Authentication required');
    }
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  updateUserRole(userId: string, role: UserRole): Observable<{success: boolean; message: string; data: User}> {
    const url = `${this.apiUrl}/${userId}`;
    const headers = this.getAuthHeaders();
    
    return this.http.patch<{success: boolean; message: string; data: User}>(
      url,
      { role },
      headers
    );
  }

  getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Observable<UsersResponse> {
    const timestamp = Date.now();
    
    let httpParams = new HttpParams()
      .set('_t', timestamp.toString());
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role) httpParams = httpParams.set('role', params.role);
    if (params.status) httpParams = httpParams.set('status', params.status);
    
    const token = localStorage.getItem('cb_access_token');    
    
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }),
      params: httpParams,
      withCredentials: false
    };
    return this.http.get<UsersResponse>(this.apiUrl, options);
  }
}