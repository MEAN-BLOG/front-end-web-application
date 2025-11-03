import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen">
      <app-navbar></app-navbar>
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .main-content {
        margin: 0 auto;
        margin-top: 60px;
        min-height: 94vh;
      }
    `,
  ],
})
export class AppComponent {
  title = 'Collab Blog';
}
