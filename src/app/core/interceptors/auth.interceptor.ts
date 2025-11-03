import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (request.url.includes('auth')) {
    return next(request);
  }

  const token = localStorage.getItem(environment.tokenKey);

  if (token) {
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
      withCredentials: true,
    });
    return next(authReq);
  }

  return next(request);
}
