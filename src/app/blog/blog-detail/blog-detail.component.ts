import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostService } from '../../shared/services/post.service';
import { Post, CommentResponse } from '../../core/models/post.model';
import { Comment } from '../../core/models/comment.model';
import { AuthService } from '../../core/services/auth.service';
import { ReplyComponent } from '../../shared/components/reply/reply.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    ReplyComponent
  ],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  post: Post | null = null;
  isLoading = true;
  isSubmittingComment = false;
  error: string | null = null;
  commentForm: FormGroup;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly postService: PostService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
    } else {
      this.error = 'No post ID provided';
      this.isLoading = false;
    }
  }

  private loadPost(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.postService.getPostById(id).subscribe({
      next: (response: any) => {
        console.log('Post response:', response); // Debug log
        if (response?.success && response.data) {
          this.post = response.data;
        } else {
          this.error = response?.message ?? 'Failed to load post';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.error = error.error?.message || 'Failed to load post. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  getFeaturedImage(post: Post): string {
    return post.image || '/images/blog.jpg';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onSubmitComment(): void {
    if (this.commentForm.invalid || !this.post) return;

    this.isSubmittingComment = true;
    const commentData = {
      content: this.commentForm.get('content')?.value,
      postId: this.post._id
    };

    this.postService.addComment(commentData).subscribe({
      next: (response: CommentResponse) => {
        if (response.success && this.post) {
          // Add the new comment to the list
          this.post.commentIds = [response.data, ...(this.post.commentIds || [])];
          this.commentForm.reset();
          this.snackBar.open('Comment added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
        this.isSubmittingComment = false;
      },
      error: (error: any) => {
        console.error('Error adding comment:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to add comment. Please try again.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        this.isSubmittingComment = false;
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getAuthorName(userId: any): string {
    if (!userId || typeof userId === 'string') return 'Anonymous';
    const { firstName, lastName, email } = userId;
    const name = [firstName, lastName].filter(Boolean).join(' ');
    return name || email || 'Anonymous';
  }
}
