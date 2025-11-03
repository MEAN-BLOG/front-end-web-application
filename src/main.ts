import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from './environments/environment';
import { firebaseProviders } from './app/core/services/firebase';

/**
 * Application bootstrap entry point.
 *
 * This file bootstraps the root Angular application using the standalone
 * `bootstrapApplication()` API.
 *
 * Responsibilities:
 * - Registers global providers (HTTP client, routing, Firebase, Angular Material modules …)
 * - Injects BrowserAnimationsModule (required for Angular Material)
 * - Registers the global environment API base URL token
 *
 * Providers included:
 * - HttpClientModule: Enables HTTP requests across the app
 * - BrowserAnimationsModule: Enables Material and animation support
 * - AppRoutingModule: Global routing config
 * - Angular Material modules used app-wide (Input, Button, FormField, Card, SnackBar)
 * - firebaseProviders: Firebase initialization + injectable services
 * - `API_BASE_URL`: App-wide environment API endpoint
 *
 * @file main.ts
 */
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      HttpClientModule,
      BrowserAnimationsModule,
      AppRoutingModule,
      MatInputModule,
      MatButtonModule,
      MatFormFieldModule,
      MatCardModule,
      MatSnackBarModule,
    ),
    firebaseProviders,
    { provide: 'API_BASE_URL', useValue: environment.apiUrl },
  ],
});
