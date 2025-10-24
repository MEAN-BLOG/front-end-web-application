import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService, 
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | boolean | UrlTree {
    // Check for tokens first for immediate response
    const hasAccessToken = !!this.auth.getAccessToken();
    const hasRefreshToken = !!this.auth.getRefreshToken();

    // If no tokens at all, allow access to guest routes
    if (!hasAccessToken && !hasRefreshToken) {
      return true;
    }

    // If we have tokens, check the user state
    return this.auth.user$.pipe(
      take(1),
      map(user => {
        // If there's no user but we have tokens, the app is still loading
        // Allow access to avoid redirect loops
        if (!user) {
          return true;
        }
        
        // If user is logged in, redirect to home or returnUrl
        const returnUrl = this.getSafeReturnUrl(route.queryParams['returnUrl']);
        return this.router.createUrlTree([returnUrl]);
      })
    );
  }

  private getSafeReturnUrl(returnUrl: string | undefined): string {
    if (!returnUrl) return '/';
    
    // Prevent open redirects by ensuring the URL is relative
    try {
      const url = new URL(returnUrl, globalThis.location.origin);
      // Only allow relative URLs or same-origin absolute URLs
      if (url.origin === globalThis.location.origin) {
        return url.pathname + url.search + url.hash;
      }
    } catch {
      if (returnUrl.startsWith('/')) {
        return returnUrl;
      }
    }
    
    return '/';
  }
}
