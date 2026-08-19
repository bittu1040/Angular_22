import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">Login</h2>

              <div *ngIf="errorMessage()" class="alert alert-danger">
                {{ errorMessage() }}
              </div>

              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    [(ngModel)]="formData.email"
                    name="email"
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    [(ngModel)]="formData.password"
                    name="password"
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  [disabled]="authService.isLoading()"
                >
                  {{ authService.isLoading() ? 'Logging in...' : 'Login' }}
                </button>
              </form>

              <p class="text-center text-muted">
                Don't have an account?
                <a routerLink="/register" class="text-decoration-none">Register here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 8px;
    }
  `]
})
export class LoginComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  formData: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.formData.email || !this.formData.password) {
      this.errorMessage.set('Email and password are required');
      return;
    }

    this.errorMessage.set(null);
    this.authService.login(this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/tasks']);
        }
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Login failed');
      }
    });
  }
}
