import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'blog',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'blog',
    loadChildren: () => import('./blog/blog.module').then((m) => m.BlogModule),
    data: { title: 'Blog' },
  },
  {
    path: 'admin',
    loadChildren: () => import('./dashboards/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Admin',
      roles: ['admin'],
    },
  },
  {
    path: 'writer',
    loadChildren: () => import('./dashboards/writer/writer.module').then((m) => m.WriterModule),
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Writer',
      roles: ['writer'],
    },
  },
  {
    path: 'editor',
    loadChildren: () => import('./dashboards/editor/editor.module').then((m) => m.EditorModule),
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Editor',
      roles: ['editor'],
    },
  },
  {
    path: 'access-denied',
    loadChildren: () =>
      import('./core/components/access-denied/access-denied.module').then(
        (m) => m.AccessDeniedModule,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
      enableTracing: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
