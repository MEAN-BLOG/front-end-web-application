import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { EditorRoutingModule } from './editor-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { PostsModule } from '../admin/posts/posts.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    EditorRoutingModule,
    SharedModule,
    PostsModule,
    DashboardComponent
  ]
})
export class EditorModule { }
