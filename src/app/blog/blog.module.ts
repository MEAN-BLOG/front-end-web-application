import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogDetailComponent } from './article-details-page/article-details-page.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { BlogListComponent } from './articles-page/articles-page.component';
import { AuthGuard } from '../core/guards/auth.guard';

/**
 * @module BlogModule
 * 
 * @description
 * Angular feature module for handling the blog section of the application.
 * It provides:
 * - A blog list view (`BlogListComponent`)
 * - A blog detail view (`BlogDetailComponent`) protected by `AuthGuard`
 * 
 * This module imports required Angular Material modules for UI components, 
 * reactive forms for comment submission, and routing configuration for child routes.
 */

/**
 * @constant {Routes} routes
 * @description
 * Routes configuration for the BlogModule:
 * - `/` → Blog list page
 * - `/:id` → Blog detail page, requires authentication via `AuthGuard`
 */
const routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BlogListComponent
      },
      {
        path: ':id',
        component: BlogDetailComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    BlogListComponent,
    BlogDetailComponent
  ],
  /**
   * @description
   * Exports, declarations, and providers can be added here if needed. Currently,
   * this module only declares the components as part of the module imports.
   */
})
export class BlogModule { }
