import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PostService } from '../shared/services/post.service';
import { Post } from '../core/models/post.model';

interface PostWithImage extends Post {
  imageLoaded?: boolean;
}

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  posts: PostWithImage[] = [];
  isLoading = false;
  totalPosts = 0;
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 100];
  totalItems = 0;
  searchControl = new FormControl('');
  skeletonArray = new Array(10).fill(0);
  
  constructor(private readonly postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
    
    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadPosts();
    });
  }

  loadPosts(): void {
    this.isLoading = true;
    const searchTerm = this.searchControl.value || '';    
    this.postService.getPosts({
      page: this.pageIndex + 1,
      limit: this.pageSize,
      search: searchTerm
    }).subscribe({
      next: (response: any) => {
        this.posts = response.data || [];
        // Update pagination
        this.totalItems = response.pagination?.total || response.total || 0;
        this.pageSize = response.pagination?.limit || this.pageSize;
        this.pageIndex = (response.pagination?.page || 1) - 1; // Convert to 0-based index
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
        this.posts = [];
        this.totalPosts = 0;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }

  getFeaturedImage(post: PostWithImage): string {
    // Default image if none provided
    return post.image || '/images/blog.jpg';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/images/blog.jpg';
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }
}
