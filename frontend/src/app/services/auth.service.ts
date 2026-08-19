import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User, RegisterRequest, LoginRequest, AuthResponse, CurrentUserResponse } from '../models/user.model';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;

  // Signal for current user
  currentUser = signal<User | null>(null);

  // Signal for access token
  accessToken = signal<string | null>(null);

  // Signal for loading state
  isLoading = signal(false);

  register(data: RegisterRequest) {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        if (response.success) {
          console.log('[AuthService] Registration successful');
          this.accessToken.set(response.data.accessToken);
          this.currentUser.set(response.data.user);
        }
        this.isLoading.set(false);
      })
    );
  }

  login(data: LoginRequest) {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        if (response.success) {
          console.log('[AuthService] Login successful');
          this.accessToken.set(response.data.accessToken);
          this.currentUser.set(response.data.user);
        }
        this.isLoading.set(false);
      })
    );
  }

  getCurrentUser() {
    return this.http.get<CurrentUserResponse>(`${this.apiUrl}/me`).pipe(
      tap((response) => {
        if (response.success) {
          this.currentUser.set(response.data);
        }
      })
    );
  }

  refreshToken() {
    console.log('[AuthService] Calling refresh token endpoint');
    return this.http.post<{ success: boolean; message: string; data: { accessToken: string } }>(
      `${this.apiUrl}/refresh-token`,
      {}
    ).pipe(
      tap((response) => {
        if (response.success) {
          console.log('[AuthService] Token refreshed successfully');
          this.accessToken.set(response.data.accessToken);
        }
      })
    );
  }

  restoreSession() {
    return this.refreshToken().pipe(
      switchMap(() => this.getCurrentUser()),
      catchError(() => {
        this.clearAuth();
        return EMPTY;
      })
    );
  }

  logout() {
    this.isLoading.set(true);
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        console.log('[AuthService] Logout successful');
        this.clearAuth();
        this.isLoading.set(false);
      })
    );
  }

  clearAuth() {
    this.accessToken.set(null);
    this.currentUser.set(null);
  }

  getAccessToken(): string | null {
    const token = this.accessToken();
    console.log('[AuthInterceptor] Getting access token, available:', !!token);
    return token;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken();}
}

