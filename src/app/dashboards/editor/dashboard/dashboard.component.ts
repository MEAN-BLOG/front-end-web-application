import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-editor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <h2>Editor Dashboard</h2>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/editor/posts" routerLinkActive="active">
            <mat-icon>article</mat-icon>
            <span>Manage Posts</span>
          </a>
          <a mat-list-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="spacer"></span>
          <span class="welcome-message">Welcome, {{ currentUser?.firstName || 'Editor' }}!</span>
        </mat-toolbar>

        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100vh;
      }

      .sidenav {
        width: 250px;
        box-shadow: 3px 0 6px rgba(0, 0, 0, 0.24);
      }

      .sidenav-header {
        padding: 16px;
        background-color: #3f51b5;
        color: white;
      }

      .sidenav-header h2 {
        margin: 0;
        font-size: 1.2rem;
      }

      .content {
        padding: 20px;
      }

      .toolbar {
        position: sticky;
        top: 0;
        z-index: 2;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .welcome-message {
        margin-right: 16px;
      }

      .container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .active {
        background-color: rgba(0, 0, 0, 0.04);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: any;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
