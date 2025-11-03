import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

export function jwtInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  const authToken = authService.getAccessToken();

  // Clone the request and add the authorization header if token exists
  if (authToken) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  // Pass the cloned request to the next handler
  return next(request);
}
