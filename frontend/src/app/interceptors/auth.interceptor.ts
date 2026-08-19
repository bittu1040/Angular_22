import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RefreshTokenStateService {
  isRefreshing = false;
  readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);
}

// Helper: Check if request targets login/refresh endpoints to prevent infinite loops
const isTokenRequest = (req: HttpRequest<unknown>): boolean => {
  return req.url.includes('/refresh-token') || req.url.includes('/logout');
};
 
// Helper: Clone and append the bearer token to the headers
const addToken = (req: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`, // Added 'Bearer ' which is standard format
    },
  });
};

// Helper: Handle 401 Unauthorized queueing and execution
const handle401Error = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  state: RefreshTokenStateService
): Observable<HttpEvent<unknown>> => {
  if (!state.isRefreshing) {
    state.isRefreshing = true;
    state.refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        state.isRefreshing = false;
        const newToken = response.data.accessToken;
        state.refreshTokenSubject.next(newToken);

        // Retry the original request with the fresh token
        return next(addToken(req, newToken));
      }),
      catchError((err) => {
        state.isRefreshing = false;
        authService.clearAuth();
        return throwError(() => err);
      })
    );
  } else {
    // If a refresh is already in progress, wait for the token to emit
    return state.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next(addToken(req, token!)))
    );
  }
};

// Main Functional Interceptor Export
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  let modifiedReq = req;

  // Append token to outgoing request if it exists and isn't an auth endpoint
  if (token && !isTokenRequest(req)) {
    modifiedReq = addToken(req, token);
  }

  // Intercept the request stream
  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isTokenRequest(modifiedReq)) {
        return handle401Error(modifiedReq, next, authService, inject(RefreshTokenStateService));
      }
      return throwError(() => error);
    })
  );
};
