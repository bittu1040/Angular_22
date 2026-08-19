import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshToken$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isAuthRequest =
    req.url.includes('/refresh-token') ||
    req.url.includes('/logout');

  const token = authService.getAccessToken();

  // Keep the refresh token in its HTTP-only cookie.
  let authReq = req.clone({ withCredentials: true });

  if (token && !isAuthRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(authReq).pipe(
    catchError((error: unknown) => {
      // Only handle 401 responses
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isAuthRequest
      ) {
        return throwError(() => error);
      }

      // Wait if another request is already refreshing the token
      if (isRefreshing) {
        return refreshToken$.pipe(
          filter((token): token is string => token !== null),
          take(1),
          switchMap((newToken) =>
            next(
              authReq.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              })
            )
          )
        );
      }

      // Start token refresh
      isRefreshing = true;
      refreshToken$.next(null);

      return authService.refreshToken().pipe(
        switchMap((response) => {
          const newToken = response.data.accessToken;

          isRefreshing = false;
          refreshToken$.next(newToken);

          // Retry original request with new token
          return next(
            authReq.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            })
          );
        }),   
        catchError((refreshError) => {
          isRefreshing = false;
          refreshToken$.next(null);

          authService.clearAuth();

          return throwError(() => refreshError);
        })
      );
    })
  );
};