import { Routes } from '@angular/router';

export const serverRoutes: Routes = [
  { 
    path: '', 
    redirectTo: 'articles', 
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'articles',
    loadChildren: () => import('./articles/articles.routes').then(m => m.ARTICLES_ROUTES)
  },
  { 
    path: '**', 
    redirectTo: 'articles'
  }
];