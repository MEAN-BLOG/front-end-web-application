import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../core/services/loading.service';

export function loadingInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const loadingService = inject(LoadingService);
  
  // Don't show loading for these requests
  if (request.url.includes('/api/notifications') || 
      request.url.includes('/api/status')) {
    return next(request);
  }

  loadingService.setLoading(true, request.url);
  
  return next(request).pipe(
    finalize(() => {
      loadingService.setLoading(false, request.url);
    })
  );
}
