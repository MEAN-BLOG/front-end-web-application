import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface StatsData {
  totalArticles: number;
  totalAuthors: number;
  totalComments: number;
  totalTags: number;
}

export interface StatsResponse extends ApiResponse<StatsData> {}

interface MonthlyArticleCount {
  date: string;
  count: number;
}

export interface MonthlyArticlesResponse extends ApiResponse<MonthlyArticleCount[]> {}

export interface ArticleStats {
  _id: string;
  title: string;
  views?: number;
  commentCount?: number;
  coverImage?: string;
  createdAt: string;
}

export interface TopArticlesResponse extends ApiResponse<ArticleStats[]> {}

export interface TagStats {
  tag: string;
  count: number;
}

export interface TopTagsResponse extends ApiResponse<TagStats[]> {}

export interface TopAuthor {
  authorId: string;
  name?: string;
  email?: string;
  articleCount: number;
}

export interface TopAuthorsResponse extends ApiResponse<TopAuthor[]> {}

export interface AuthorFrequency {
  authorId: string;
  name: string;
  avgPerMonth: number;
}

export interface AuthorFrequencyResponse extends ApiResponse<AuthorFrequency[]> {}

export interface AuthorTrend {
  authorId: string;
  authorName: string;
  month: number;
  year: number;
  count: number;
}

export interface AuthorTrendsResponse extends ApiResponse<AuthorTrend[]> {}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly apiUrl = `${environment.apiUrl}/statistics`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  /**
   * Get overview statistics
   */
  getOverview(): Observable<StatsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<StatsResponse>(`${this.apiUrl}/overview`, headers);
  }

  /**
   * Get articles published per month
   */
  getArticlesPerMonth(): Observable<MonthlyArticlesResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<MonthlyArticlesResponse>(
      `${this.apiUrl}/articles/monthly`, headers
    );
  }

  /**
   * Get average articles per author
   */
  getAverageArticlesPerAuthor(): Observable<ApiResponse<{ average: number }>> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<{ average: number }>>(
      `${this.apiUrl}/articles/average`, headers
    );
  }

  /**
   * Get top viewed articles
   */
  getTopViewedArticles(): Observable<TopArticlesResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<TopArticlesResponse>(
      `${this.apiUrl}/articles/top-viewed`, headers
    );
  }

  /**
   * Get most commented articles
   */
  getMostCommentedArticles(): Observable<TopArticlesResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<TopArticlesResponse>(
      `${this.apiUrl}/articles/most-commented`, headers
    );
  }

  /**
   * Get top tags used in articles
   */
  getTopTags(): Observable<TopTagsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<TopTagsResponse>(
      `${this.apiUrl}/tags/top`, headers
    );
  }

  /**
   * Get top authors by number of articles
   */
  getTopAuthors(): Observable<TopAuthorsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<TopAuthorsResponse>(
      `${this.apiUrl}/authors/top`, headers
    );
  }

  /**
   * Get average articles per author per month
   */
  getAuthorFrequency(): Observable<AuthorFrequencyResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<AuthorFrequencyResponse>(
      `${this.apiUrl}/authors/frequency`, headers
    );
  }

  /**
   * Get article creation trends per author (monthly)
   */
  getAuthorTrends(): Observable<AuthorTrendsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<AuthorTrendsResponse>(
      `${this.apiUrl}/authors/trend`, headers
    );
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No access token found');
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
}
