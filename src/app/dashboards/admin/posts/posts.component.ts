import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

import { PostService } from '../../../shared/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PostFormDialogComponent } from './post-form-dialog/post-form-dialog.component';
import { Post, PostListResponse } from '../../../core/models/post.model';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.html',
  styleUrls: ['./posts.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    FormsModule
  ],
  providers: [DatePipe]
})
export class PostsComponent implements OnInit, OnDestroy {
  // Table data
  dataSource = new MatTableDataSource<Post>([]);
  selection = new SelectionModel<Post>(true, []);
  totalItems = 0;
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  
  // Search and filters
  searchTerm = '';
  isLoading = false;
  
  // Table columns
  displayedColumns = ['select', 'title', 'author', 'createdAt', 'updatedAt', 'actions'];
  
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly postService: PostService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly datePipe: DatePipe
  ) {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadPosts());
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(searchValue: string): void {
    this.searchTerm = searchValue;
    this.pageIndex = 0;
    this.searchSubject.next(searchValue);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }

  onSelectionChange(selectedItems: Post[]): void {
    this.selection.clear();
    selectedItems.forEach(item => this.selection.select(item));
  }

  clearSelection(): void {
    this.selection.clear();
  }

  loadPosts(): void {
    this.isLoading = true;
    
    const isWriter = this.authService.getUserRole() === 'writer';
    const params = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      search: this.searchTerm
    };
    
    const postsObservable = isWriter 
      ? this.postService.getMyPosts(params)
      : this.postService.getPosts(params);
    
    postsObservable.subscribe({
      next: (response: PostListResponse) => {
        if (response?.success) {
          this.dataSource.data = response.data;
          this.totalItems = response.pagination?.total || 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.snackBar.open('Failed to load posts', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PostFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { mode: 'create' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Refresh posts list
        this.loadPosts();
      }
    });
  }

  openEditDialog(post: Post): void {
    const dialogRef = this.dialog.open(PostFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { 
        mode: 'edit',
        post: post 
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Update the post in the table
        const index = this.dataSource.data.findIndex(p => p._id === result.data._id);
        if (index > -1) {
          const updatedPosts = [...this.dataSource.data];
          updatedPosts[index] = result.data;
          this.dataSource.data = updatedPosts;
        }
        this.loadPosts();
      }
    });
  }

  confirmDelete(post: Post): void {
    if (!this.isAdmin()) {
      this.snackBar.open('Only administrators can perform this action', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Post',
        message: `Are you sure you want to delete "${post.title}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deletePost(post._id);
      }
    });
  }

  private deletePost(postId: string): void {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe({
      next: (response) => {
        if (response?.success) {
          this.snackBar.open('Post deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPosts();
        }
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        this.snackBar.open('Failed to delete post', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  // Format date for display
  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'medium') || '';
  }

  // Get author name
  getAuthorName(post: Post): string {
    return post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Unknown';
  }

  // Check if all rows are selected
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  // Toggle all rows selection
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  // Checkbox label for row
  checkboxLabel(row?: Post): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row._id}`;
  }

  /**
   * Check if current user is an admin
   */
  isAdmin(): boolean {
    return this.authService.getUserRole() === 'admin';
  }

  // Bulk delete selected posts
  bulkDeleteSelected(): void {
    if (!this.isAdmin()) {
      this.snackBar.open('Only administrators can perform this action', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const selectedIds = this.selection.selected.map(post => post._id);
    if (selectedIds.length === 0) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Selected Posts',
        message: `Are you sure you want to delete ${selectedIds.length} selected post(s)?`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        const deleteObservables = selectedIds.map(id => this.postService.deletePost(id));
        
        // Wait for all delete operations to complete
        Promise.all(deleteObservables.map(obs => obs.toPromise()))
          .then(() => {
            this.snackBar.open(`Successfully deleted ${selectedIds.length} post(s)`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.selection.clear();
            this.loadPosts();
          })
          .catch(error => {
            console.error('Error deleting posts:', error);
            this.snackBar.open('Failed to delete some posts', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          });
      }
    });
  }
}
