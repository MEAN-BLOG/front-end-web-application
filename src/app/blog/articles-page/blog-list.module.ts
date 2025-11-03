import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlogListComponent } from './articles-page.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { PostService } from '../../shared/services/post.service';

/**
 * Custom paginator labels for internationalization / UI tweaks.
 */
const customPaginatorIntl = new MatPaginatorIntl();
customPaginatorIntl.itemsPerPageLabel = 'Items per page:';
customPaginatorIntl.nextPageLabel = 'Next page';
customPaginatorIntl.previousPageLabel = 'Previous page';
customPaginatorIntl.firstPageLabel = 'First page';
customPaginatorIntl.lastPageLabel = 'Last page';

/**
 * Application routes for the Blog List module.
 */
const routes: Routes = [
  {
    path: '',
    component: BlogListComponent,
    data: { title: 'Blog' },
  },
];

/**
 * BlogListModule
 *
 * @description
 * Angular module responsible for rendering the blog list page with:
 * - Material cards for displaying blog posts
 * - Search and pagination controls
 * - Reactive forms support
 *
 * Provides:
 * - `PostService` for fetching posts from backend API
 * - Custom `MatPaginatorIntl` for user-friendly pagination labels
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BlogListComponent,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  providers: [PostService, { provide: MatPaginatorIntl, useValue: customPaginatorIntl }],
})
export class BlogListModule {}
