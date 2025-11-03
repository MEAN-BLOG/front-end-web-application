import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles: string[] = route.data['roles'] || [];

    // If no roles are specified, allow access
    if (allowedRoles.length === 0) {
      return true;
    }

    return this.auth.user$.pipe(
      take(1), // Take the first emitted value and complete
      map((user) => {
        // If user is not logged in, redirect to login
        if (!user) {
          return this.router.createUrlTree(['/auth/login'], {
            queryParams: {
              returnUrl: state.url,
              message: 'Please log in to access this page.',
            },
          });
        }

        // Check if user has any of the required roles
        const hasRequiredRole = allowedRoles.includes(user.role);

        if (!hasRequiredRole) {
          console.warn(
            `Access Denied: User does not have required role. Required: ${allowedRoles.join(', ')}`,
          );
          return this.router.createUrlTree(['/access-denied'], {
            queryParams: {
              returnUrl: state.url,
              message: 'You do not have permission to access this page.',
              isLoggedIn: 'true',
            },
          });
        }

        return true;
      }),
    );
  }
}
