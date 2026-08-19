import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected authService = inject(AuthService);
  private router = inject(Router);

  onLogout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}

