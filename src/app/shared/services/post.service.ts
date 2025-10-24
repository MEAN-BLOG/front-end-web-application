import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { Post, PostResponse, PostListResponse, CommentResponse } from '../../core/models/post.model';

interface AddCommentData {
  content: string;
  postId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiUrlArticles = `${environment.apiUrl}/articles`;
  private readonly apiUrlComment = `${environment.apiUrl}/comments`;
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getPosts(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Observable<PostsResponse> {
    let url = `${this.apiUrlArticles}?page=${params.page || 1}&limit=${params.limit || 10}`;
    if (params.search) {
      url += `&search=${encodeURIComponent(params.search)}`;
    }
    
    // For public access, we might need a different endpoint or no auth headers
    const isPublicAccess = !this.authService.isAuthenticated();
    const options = isPublicAccess ? {} : this.getAuthHeaders();
    
    return this.http.get<PostsResponse>(url, options);
  }

  // Delete a post
  deletePost(postId: string): Observable<{ success: boolean; message: string }> {
    const url = `${this.apiUrlArticles}/${postId}`;
    return this.http.delete<{ success: boolean; message: string }>(url, this.getAuthHeaders());
  }

  // Create a new post
  createPost(postData: {
    title: string;
    content: string;
    image?: string;
    tags?: string[];
  }): Observable<{ success: boolean; message: string; data: Post }> {
    return this.http.post<{ success: boolean; message: string; data: Post }>(
      this.apiUrlArticles,
      postData,
      this.getAuthHeaders()
    );
  }

  // Update a post
  updatePost(
    postId: string, 
    postData: {
      title?: string;
      content?: string;
      image?: string;
      tags?: string[];
    }
  ): Observable<{ success: boolean; message: string; data: Post }> {
    const url = `${this.apiUrlArticles}/${postId}`;
    return this.http.put<{ success: boolean; message: string; data: Post }>(
      url,
      postData,
      this.getAuthHeaders()
    );
  }

  getMyPosts(params: {
      page?: number;
      limit?: number;
      search?: string;
    }): Observable<PostListResponse> {
      let url = `${this.apiUrlArticles}/my-articles?page=${params.page || 1}&limit=${params.limit || 10}`;
      if (params.search) {
        url += `&search=${encodeURIComponent(params.search)}`;
      }
      return this.http.get<PostListResponse>(url, this.getAuthHeaders());
    }
  
    getPostById(id: string): Observable<PostResponse> {
      const url = `${this.apiUrlArticles}/${id}`;
      return this.http.get<PostResponse>(url, this.getAuthHeaders());
    }

  addComment(commentData: AddCommentData): Observable<CommentResponse> {
    const url = `${this.apiUrlComment}/articles/${commentData.postId}`;
    return this.http.post<CommentResponse>(url, { content: commentData.content }, this.getAuthHeaders());
  }
}

export interface PostsResponse {
  success: boolean;
  message: string;
  data: Post[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}
