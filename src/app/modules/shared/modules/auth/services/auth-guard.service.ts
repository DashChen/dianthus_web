import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanLoad, Route, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  canLoad(route: Route): boolean | UrlTree {
    const authTokens = this.authService.getAuthTokens();
    if (Object.entries(authTokens).length === 0) {
      return this.router.parseUrl('home');
    }
    return true;
  }

  canActivate(route: ActivatedRouteSnapshot | any, state: RouterStateSnapshot | any): boolean | UrlTree {

    const authTokens = this.authService.getAuthTokens();

    if (Object.entries(authTokens).length === 0) {
      return this.router.parseUrl('home');
    }
    return true;
  }


}
