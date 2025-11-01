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
import { PostService } from '../../shared/services/post.service';
import { Post } from '../../core/models/post.model';

/**
 * Extends Post model with optional imageLoaded flag
 */
interface PostWithImage extends Post {
  imageLoaded?: boolean;
}

/**
 * BlogListComponent
 *
 * @description
 * Displays a paginated, searchable list of blog posts using Material cards.
 * Supports loading skeletons, server-side pagination, and default images.
 */
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
  templateUrl: './articles-page.component.html'
})
export class BlogListComponent implements OnInit {
  /** Reference to the Material paginator */
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** Array of posts to display */
  posts: PostWithImage[] = [];

  /** Indicates whether posts are being loaded */
  isLoading = false;

  /** Total number of posts (for pagination) */
  totalPosts = 0;

  /** Pagination: page size */
  pageSize = 10;

  /** Pagination: current page index (0-based) */
  pageIndex = 0;

  /** Pagination options */
  pageSizeOptions = [5, 10, 25, 100];

  /** Total items for MatPaginator */
  totalItems = 0;

  /** Form control for the search input */
  searchControl = new FormControl('');

  /** Array for skeleton loading cards */
  skeletonArray = new Array(6).fill(0);

  /**
   * Constructor
   * @param postService Service to fetch posts from backend
   */
  constructor(private readonly postService: PostService) {}

  /**
   * Component initialization
   * - Loads initial posts
   * - Sets up search input with debounce
   */
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

  /**
   * Loads posts from the server with current pagination and search term
   */
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
        this.totalItems = response.pagination?.total || response.total || 0;
        this.pageSize = response.pagination?.limit || this.pageSize;
        this.pageIndex = (response.pagination?.page || 1) - 1;
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

  /**
   * Handles page changes from MatPaginator
   * @param event PageEvent object with pageIndex and pageSize
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }

  /**
   * Returns the featured image URL for a post
   * @param post Post object
   * @returns Image URL string
   */
  getFeaturedImage(post: PostWithImage): string {
    return post.image || '/images/blog.jpg';
  }

  /**
   * Handles image load errors and sets default image
   * @param event Event triggered when image fails to load
   */
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/images/blog.jpg';
  }

  /**
   * TrackBy function for *ngFor to improve performance
   * @param index Index of the item
   * @param item Post item
   * @returns Unique identifier for the item
   */
  trackByFn(index: number, item: any): any {
    return item._id || index;
  }
}
