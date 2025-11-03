import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['Admin'],
      title: 'Admin Dashboard',
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadChildren: () => import('./overview/overview.module').then((m) => m.OverviewModule),
        data: { title: 'Overview' },
      },
      {
        path: 'posts',
        loadChildren: () => import('./posts/posts.module').then((m) => m.PostsModule),
        data: { title: 'Posts Management' },
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
        data: { title: 'User Management' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
