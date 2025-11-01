import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { ReplyService } from '../../services/reply.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateReplyData, Reply } from '../../../core/models/reply.model';

/**
 * Component for displaying and managing replies to a comment.
 *
 * Features:
 * - Load replies for a given comment
 * - Show/hide replies
 * - Paginate replies
 * - Add a new reply
 * - Supports reactive forms with validation
 */
@Component({
  selector: 'app-reply',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reply.component.html'
})
export class ReplyComponent implements OnInit {
  
  /**
   * The ID of the comment for which replies will be loaded.
   */
  @Input() commentId!: string;

  /** List of replies for the comment */
  replies: Reply[] = [];

  /** Loading state for fetching replies */
  isLoading = false;

  /** Loading state for adding a new reply */
  isAddingReply = false;

  /** Whether replies list is expanded */
  showReplies = false;

  /** Whether the reply form is visible */
  showReplyForm = false;

  /** Reactive form for creating a new reply */
  replyForm: FormGroup;

  /** Current page for pagination */
  page = 1;

  /** Number of replies per page */
  limit = 10;

  /** Indicates if there are more replies to load */
  hasMore = false;

  /** Total replies fetched */
  totalReplies = 0;

  /**
   * Constructor
   * @param replyService Service for handling API calls related to replies
   * @param authService Service for authentication checks
   * @param fb FormBuilder for reactive forms
   */
  constructor(
    private readonly replyService: ReplyService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder
  ) {
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  /** Lifecycle hook: initialize component and load initial replies */
  ngOnInit(): void {
    this.loadReplies();
  }

  /** Toggle the visibility of replies */
  toggleReplies(): void {
    this.showReplies = !this.showReplies;
    if (this.showReplies) {
      this.loadReplies();
    }
  }

  /**
   * Load replies from the server
   * @param loadMore If true, fetch next page; otherwise, reset and fetch first page
   */
  loadReplies(loadMore = false): void {
    if (loadMore) {
      this.page++;
    } else {
      this.page = 1;
      this.replies = [];
    }

    this.isLoading = true;

    this.replyService.getReplies(this.commentId, this.page, this.limit).subscribe({
      next: (response) => {
        if (response.success) {
          const fetchedReplies = Array.isArray(response.data) ? response.data : [];
          this.replies = loadMore ? [...this.replies, ...fetchedReplies] : fetchedReplies;
          this.totalReplies = fetchedReplies.length;
          this.hasMore = fetchedReplies.length >= this.limit;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading replies:', error);
        this.isLoading = false;
        this.replies = [];
      }
    });
  }

  /**
   * Add a new reply
   */
  onAddReply(): void {
    if (this.replyForm.invalid) return;

    this.isAddingReply = true;
    const replyData: CreateReplyData = {
      commentId: this.commentId,
      content: this.replyForm.get('content')?.value
    };

    this.replyService.addReply(replyData).subscribe({
      next: (response) => {
        if (response.success) {
          this.replyForm.reset();
          this.showReplyForm = false;
          this.replies = [response.data, ...this.replies];
          this.totalReplies++;
        }
        this.isAddingReply = false;
      },
      error: (error) => {
        console.error('Error adding reply:', error);
        this.isAddingReply = false;
      }
    });
  }

  /**
   * Check if the user is authenticated
   * @returns True if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Get the author's name for a reply
   * @param userId User object or ID
   * @returns Display name of the author
   */
  getAuthorName(userId: any): string {
    if (!userId || typeof userId === 'string') return 'Anonymous';
    const { firstName, lastName, email } = userId;
    const name = [firstName, lastName].filter(Boolean).join(' ');
    return name || email || 'Anonymous';
  }

  /**
   * Format a date string for display
   * @param dateString Date string to format
   * @returns Formatted date in 'MMM DD, YYYY, HH:MM' format
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
