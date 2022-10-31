import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { BehaviorSubject, catchError, EMPTY, filter, ignoreElements, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from '@shared-auth/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TimeoutDialogComponent } from '@shared-auth/components/timeout-dialog/timeout-dialog.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  refreshUrl: {[key: string]: string};
  loginUrl: string = '';

  apNameMap: {[key: string]: string} = {};
  notAddTokenUrl: string[] = [];

  apName: string = '';

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginUrl = this.authService.getLoginUrl();
    this.notAddTokenUrl = [...this.notAddTokenUrl, ...[this.loginUrl]];
    this.refreshUrl = this.authService.getRefreshUrl();
    Object.entries(this.refreshUrl).forEach(([key, url]) => {
      this.notAddTokenUrl = [...this.notAddTokenUrl, ...[url]];
    });
    this.apNameMap = this.authService.getAPNameMapUrl();
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // return next.handle(request);
    const isNotAddTokenUrl = this.checkIsNotAddTokenUrl(request.url);
    if (isNotAddTokenUrl === true) {
      return next.handle(request);
    }

    const authToken = this.authService.getAuthSubject().authToken ?? undefined;
    if (authToken === undefined) {
      console.warn('access token is empty, do logout');
      this.logout();
      return EMPTY;
    }

    Object.entries(this.apNameMap).forEach(([key, value]) => {
      if (request.url.includes(value)){
        this.apName = key;
      }
    });

    const accessToken = this.authService.getAuthSubject().authToken[this.apName].accessToken ?? '';
    const tokenType = this.authService.getAuthSubject().authToken[this.apName].tokenType ?? 'Bearer';
    if (accessToken === '') {
      console.warn('authToken is empty, do logout');
      this.logout();
      return EMPTY;
    }

    request = request.clone({
      setHeaders: {
          Authorization: `${tokenType} ${accessToken}`
      }
    });

    return next.handle(request).pipe(
      catchError(error => {
        // Only handle http status 401
        if (error.status !== 401) {
          return throwError(error);
        }
        // Do not need to refresh token api
        const isNotAddTokenUrl = this.checkIsNotAddTokenUrl(request.url);
        if (isNotAddTokenUrl === true) {
          if (request.url.includes(this.loginUrl)) {
            return throwError(error);
          } else {
            this.logout();
          }
        }
        this.refreshToken(this.refreshTokenInProgress);
        return this.refreshTokenSubject.pipe(
          tap(result => console.log(result)),
          filter(result => result !== undefined),
          take(1),
          switchMap(() => next.handle(this.addAuthenticationToken(request)))
        );
      })
    );
  }

  checkIsNotAddTokenUrl(url: string): boolean {
    return this.notAddTokenUrl.includes(url);
  }

  logout(): void {
    // when refresh fail do logout and redirect to unauthorized page
    this.authService.logout().subscribe(
      logoutSuccess => {
        if (logoutSuccess) {
          const dialogRef = this.dialog.open(TimeoutDialogComponent, {
            width: "400px",
            autoFocus: false,
            disableClose: true
          });
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/home']);
          });
        }
      }
    )
  }

  addAuthenticationToken(req: HttpRequest<any>) {
    const accessToken = this.authService.getAuthSubject().authToken[this.apName]?.accessToken ?? '';
    const tokenType = this.authService.getAuthSubject().authToken[this.apName]?.tokenType ?? 'Bearer';
    if (accessToken === '') {
      console.warn('authToken is empty, do logout');
      return req;
    }

    // We clone the request, because the original request is immutable
    return req.clone({
      setHeaders: {
          Authorization: `${tokenType} ${accessToken}`
      }
    });
  }


  refreshToken(isRefreshing: boolean): void {
    if (isRefreshing) {
      // Someone is refreshing token now, pending request
      console.log('Someone is refreshing token now, pending request');
    } else {
      this.refreshTokenInProgress = true;
      this.authService.refreshToken().subscribe({
        next: token => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(token);

        },
        error: error => {
          this.refreshTokenInProgress = false;
          this.logout();
        }
      });
    }
  }




}
