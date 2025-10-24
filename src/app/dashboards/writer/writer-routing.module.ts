import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WriterComponent } from './writer.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: WriterComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('../admin/posts/posts.module').then(m => m.PostsModule),
        data: { title: 'Posts Management' }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WriterRoutingModule { }
