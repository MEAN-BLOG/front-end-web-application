import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const editorRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['editor'] },
    children: [
      {
        path: '',
        loadChildren: () => import('../admin/posts/posts.module').then(m => m.PostsModule),
        data: { title: 'Editor Dashboard' }
      },
      { path: '', redirectTo: 'posts', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(editorRoutes)],
  exports: [RouterModule]
})
export class EditorRoutingModule { }
