import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-writer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class WriterComponent implements OnInit {
  currentUser: any;

  constructor(private readonly auth: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
  }

  logout(): void {
    this.auth.logout();
  }
}
