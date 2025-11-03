import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ReplyListResponse, ReplyResponse, CreateReplyData } from '../../core/models/reply.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReplyService {
  private readonly apiUrl = `${environment.apiUrl}/replies`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  // Get replies for a comment with pagination
  getReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<ReplyListResponse> {
    const url = `${this.apiUrl}/comments/${commentId}?page=${page}&limit=${limit}`;
    return this.http.get<ReplyListResponse>(url, this.getAuthHeaders());
  }

  // Add a reply to a comment
  addReply(replyData: CreateReplyData): Observable<ReplyResponse> {
    const url = `${this.apiUrl}/comments/${replyData.commentId}`;
    return this.http.post<ReplyResponse>(
      url,
      { content: replyData.content },
      this.getAuthHeaders(),
    );
  }

  // Delete a reply
  deleteReply(replyId: string): Observable<{ success: boolean; message: string }> {
    const url = `${this.apiUrl}/${replyId}`;
    return this.http.delete<{ success: boolean; message: string }>(url, this.getAuthHeaders());
  }
}
