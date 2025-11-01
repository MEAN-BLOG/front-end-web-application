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
  @Input() commentId!: string;

  replies: Reply[] = [];
  isLoading = false;
  isAddingReply = false;
  showReplies = false;
  showReplyForm = false;
  replyForm: FormGroup;
  page = 1;
  limit = 10;
  hasMore = false;
  totalReplies = 0;

  constructor(
    private readonly replyService: ReplyService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder
  ) {
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.loadReplies();
  }

  toggleReplies(): void {
    this.showReplies = !this.showReplies;
    if (this.showReplies) {
      this.loadReplies();
    }
  }

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

  onAddReply(): void {
    if (this.replyForm.invalid) {
      return;
    }

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
          // Add the new reply to the beginning of the list
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

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getAuthorName(userId: any): string {
    if (!userId || typeof userId === 'string') return 'Anonymous';
    const { firstName, lastName, email } = userId;
    const name = [firstName, lastName].filter(Boolean).join(' ');
    return name || email || 'Anonymous';
  }

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
