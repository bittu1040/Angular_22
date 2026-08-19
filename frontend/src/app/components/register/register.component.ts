import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">Register</h2>

              <div *ngIf="errorMessage()" class="alert alert-danger">
                {{ errorMessage() }}
              </div>

              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="name" class="form-label">Full Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="Enter your full name"
                  />
                </div>

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
                    placeholder="Enter password (min 6 chars)"
                  />
                  <small class="text-muted d-block mt-1">Minimum 6 characters</small>
                </div>

                <button
                  type="submit"
                  class="btn btn-success w-100 mb-3"
                  [disabled]="authService.isLoading()"
                >
                  {{ authService.isLoading() ? 'Creating account...' : 'Register' }}
                </button>
              </form>

              <p class="text-center text-muted">
                Already have an account?
                <a routerLink="/login" class="text-decoration-none">Login here</a>
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
export class RegisterComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  formData: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  };

  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.password) {
      this.errorMessage.set('All fields are required');
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      return;
    }

    this.errorMessage.set(null);
    this.authService.register(this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/tasks']);
        }
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Registration failed');
      }
    });
  }
}
