import { Routes } from '@angular/router';

export const ARTICLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./articles-list/articles-list.component').then(m => m.ArticlesListComponent),
    title: 'Articles - Collab Blog'
  },
  {
    path: ':id',
    loadComponent: () => import('./article-detail/article-detail.component').then(m => m.ArticleDetailComponent),
    title: 'Article - Collab Blog'
  }
];
