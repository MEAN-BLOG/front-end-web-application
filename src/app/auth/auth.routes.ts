import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Collab Blog',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register - Collab Blog',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
