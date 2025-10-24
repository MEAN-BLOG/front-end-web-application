import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { SharedModule } from '../../../shared/shared.module';
import { AuthService } from '../../../core/services/auth.service';

import { AuthGuard } from '../../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    canActivate: [AuthGuard],
    data: { 
      title: 'Users Management',
      roles: ['admin'] // Only admin can access this route
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule, // Add RouterModule to the imports array
    RouterModule.forChild(routes),
    SharedModule,
    UsersComponent
  ],
  providers: [AuthService]
})
export class UsersModule { }
