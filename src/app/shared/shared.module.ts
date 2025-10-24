import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

// Shared Components
import { NavbarComponent } from './components/navbar/navbar.component';

// Pipes
import { TimeAgoPipe } from './pipes/time-ago.pipe';


@NgModule({
  declarations: [
    // Other components/pipes that are not standalone
  ],
  imports: [
    // Angular Modules
    CommonModule,
    RouterModule,
    
    // Standalone Components
    NavbarComponent,
    TimeAgoPipe,
    
    // Material Modules
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  exports: [
    // Components
    NavbarComponent,
    
    // Pipes
    TimeAgoPipe,
    
    // Re-export modules
    CommonModule,
    RouterModule,
    
    // Material Modules
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ]
})
export class SharedModule { }
