import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
})
export class DashboardComponent implements OnInit {
  title = 'Admin Dashboard';
  menuItems = [
    { name: 'Dashboard', icon: 'dashboard', route: '/admin' },
    { name: 'Posts', icon: 'article', route: '/admin/posts' },
    { name: 'Users', icon: 'people', route: '/admin/users' },
    { name: 'Settings', icon: 'settings', route: '/admin/settings' },
  ];

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    // Initialization logic will be added here when needed
    this.initializeDashboard();
  }

  private initializeDashboard(): void {
    // Dashboard initialization logic will go here
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']).then(() => {
      window.location.reload();
    });
  }
}
