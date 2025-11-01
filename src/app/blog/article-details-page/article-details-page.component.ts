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
import { AuthService } from '../../core/services/auth.service';
import { ReplyComponent } from '../../shared/components/reply/reply.component';

/**
 * @component BlogDetailComponent
 * @description
 * Displays the details of a single blog post including title, content, featured image, tags, and comments.
 * Allows authenticated users to add comments.
 * Supports scrolling to a specific comment via a query parameter (`referenceId`).
 * 
 * @example
 * <app-blog-detail></app-blog-detail>
 */
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
  templateUrl: './article-details-page.component.html'
})
export class BlogDetailComponent implements OnInit {
  /** The blog post object to display */
  post: Post | null = null;

  /** Loading state for fetching the post */
  isLoading = true;

  /** Loading state for submitting a comment */
  isSubmittingComment = false;

  /** Error message, if any */
  error: string | null = null;

  /** Reactive form group for comment submission */
  commentForm: FormGroup;

  /**
   * @constructor
   * @param route ActivatedRoute to access route parameters
   * @param postService Service to fetch posts and submit comments
   * @param authService Service to check authentication status
   * @param fb FormBuilder to create reactive forms
   * @param snackBar MatSnackBar for showing success/error messages
   */
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

  /**
   * On component initialization
   * Loads the blog post by ID from route parameters
   */
  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
    } else {
      this.error = 'No post ID provided';
      this.isLoading = false;
    }
  }

  /**
   * Fetches a post by its ID from the server
   * @param id The ID of the post
   */
  private loadPost(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.postService.getPostById(id).subscribe({
      next: (response: any) => {
        if (response?.success && response.data) {
          this.post = response.data;
        } else {
          this.error = response?.message ?? 'Failed to load post';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load post. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Returns the featured image URL for a post
   * @param post The blog post
   * @returns URL of the image or a default placeholder
   */
  getFeaturedImage(post: Post): string {
    return post.image || '/images/blog.jpg';
  }

  /**
   * Formats a date string into a readable format
   * @param dateString ISO date string
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Handles submission of a new comment
   */
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
          this.post.commentIds = [response.data, ...(this.post.commentIds || [])];
          this.commentForm.reset();
          this.snackBar.open('Comment added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
        this.isSubmittingComment = false;
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Failed to add comment. Please try again.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        this.isSubmittingComment = false;
      }
    });
  }

  /**
   * Checks if the user is authenticated
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Returns a readable author name
   * @param userId Object containing user info or string
   * @returns Formatted author name
   */
  getAuthorName(userId: any): string {
    if (!userId || typeof userId === 'string') return 'Anonymous';
    const { firstName, lastName, email } = userId;
    const name = [firstName, lastName].filter(Boolean).join(' ');
    return name || email || 'Anonymous';
  }

  /**
   * After view initialization
   * Scrolls to a comment if `referenceId` query param exists
   */
  ngAfterViewInit(): void {
    const referenceId = this.route.snapshot.queryParamMap.get('referenceId');
    if (referenceId) {
      setTimeout(() => {
        this.scrollToComment(referenceId);
      }, 2000);
    }
  }

  /**
   * Scrolls to a specific comment or reply by ID
   * @param referenceId ID of the comment or reply
   */
  scrollToComment(referenceId?: string): void {
    if (!referenceId) return;

    const element = document.getElementById(referenceId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.style.backgroundColor = 'yellow';
    }
  }

  /**
   * Handles image loading errors
   * @param event The error event from the image element
   */
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/images/blog.jpg';
  }
}
