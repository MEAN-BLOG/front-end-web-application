import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlogListComponent } from './blog-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { PostService } from '../shared/services/post.service';

// Custom paginator labels
const customPaginatorIntl = new MatPaginatorIntl();
customPaginatorIntl.itemsPerPageLabel = 'Items per page:';
customPaginatorIntl.nextPageLabel = 'Next page';
customPaginatorIntl.previousPageLabel = 'Previous page';
customPaginatorIntl.firstPageLabel = 'First page';
customPaginatorIntl.lastPageLabel = 'Last page';

const routes: Routes = [
  {
    path: '',
    component: BlogListComponent,
    data: { title: 'Blog' }
  }
];

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
    ReactiveFormsModule
  ],
  providers: [
    PostService,
    { provide: MatPaginatorIntl, useValue: customPaginatorIntl }
  ]
})
export class BlogListModule { }