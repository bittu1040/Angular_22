import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated, redirect to tasks
  if (authService.isAuthenticated()) {
    router.navigate(['/tasks']);
    return false;
  }

  return true;
};
