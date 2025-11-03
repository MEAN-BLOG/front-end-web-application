import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

// Import components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AUTH_ROUTES } from './auth.routes';

@NgModule({
  imports: [
    // Angular modules
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(AUTH_ROUTES),

    // Material modules
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,

    // Feature components
    LoginComponent,
    RegisterComponent,
  ],
})
export class AuthModule {}
