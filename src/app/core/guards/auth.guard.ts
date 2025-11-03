import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    const token = this.auth.getToken();
    if (!token) {
      return this.redirectToLogin(state.url);
    }
    return true;
  }

  private redirectToLogin(currentUrl: string): UrlTree {
    const returnUrl = currentUrl.startsWith('/auth/') ? '/' : currentUrl;

    return this.router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl },
    });
  }
}
