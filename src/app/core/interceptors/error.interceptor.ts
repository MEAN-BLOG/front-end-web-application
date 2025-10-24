import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export function errorInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Auto logout if 401 response returned from api
        authService.logout();
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: router.url } 
        });
      }
      
      const errorMessage = error.error?.message || error.statusText;
      console.error('HTTP Error:', errorMessage);
      return throwError(() => error);
    })
  );
}
