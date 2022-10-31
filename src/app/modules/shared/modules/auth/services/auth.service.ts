import { Inject, Injectable } from '@angular/core';
import { HandleContext, NgHttphandlerService } from '@cg/ng-httphandler';
import { AUTH_CONFIG } from '@shared-auth/auth.module';
import { concatAll, EMPTY, from, iif, map, Observable, of, switchMap, tap, throwError, forkJoin } from 'rxjs';
import { AuthSubject } from '../models/auth-sunject.model';
import { AuthToken } from '../models/auth-token.model';
import { Principal } from '../models/principal.model';

@Injectable()
export class AuthService {

  _apName: string;
  _principal: Principal;
  _authSubject: AuthSubject | undefined;


  constructor(
    @Inject(AUTH_CONFIG) config: {apName: string},
    private httpHandler: NgHttphandlerService
  ) {
    this._apName = config.apName;
    this._principal = new Principal();

  }

  login(loginUrl: string, refreshUrl: string | {[key: string]: string}, credential: any, option?:{urlMap?: {[key: string]: string}}): Observable<HandleContext> {
    this.writeUrl(loginUrl, refreshUrl);
    if (typeof refreshUrl !== 'string') {
      const extraOption = option ?? {};
      const urlMap = extraOption.urlMap ?? {};
      if (Object.entries(urlMap).length === 0) {
        console.error('[AuthService] : Need to input apName map url. Because have two refresh url.');
        return EMPTY;
      }
      this.writeAPNameMapUrl(urlMap);
    }
    return (this.httpHandler.post(loginUrl, credential) as Observable<HandleContext>).pipe(
      switchMap(resp =>
        iif(() => resp.data !== undefined, of(resp), throwError(new HandleContext({errorCode: -1, errorMessage: '無可用的錯誤訊息'}))),
      ),
      tap(resp => {
        const data = resp.data as {[key: string]: any};
        let authTokens = {};
        Object.keys(data).forEach(apName => {
          authTokens = {...authTokens, ...{[apName]: new AuthToken(data[apName])}};
          this._principal.addProperty(data[apName].userInfo);
        });
        this._authSubject = new AuthSubject(this._principal, authTokens);
        this.writeAuthSubject(this._authSubject);
        return resp;
      })
    );
  }

  // 2個token 要同時refresh
  refreshToken(): Observable<any> {
    const authToken = this._authSubject?.authToken ?? this.getAuthTokens();
    const refreshUrl = this.getRefreshUrl();
    let subject: Observable<HandleContext>[] = [];
    console.log('[refreshToken] authToken: ', authToken);
    Object.entries(authToken).forEach(([key, value]) => {
      const obse = (this.httpHandler.post(refreshUrl[key], {
        accessToken: value.accessToken,
        refreshToken: value.refreshToken
      }) as Observable<HandleContext>).pipe(
        switchMap(resp =>
          iif(() => resp.data !== undefined, of(resp), throwError(new HandleContext({errorCode: -1, errorMessage: '無可用的錯誤訊息'}))),
        ),
        map(resp => {
          const data = resp.data as AuthToken;
          let authTokens = {};
          Object.keys(authToken).forEach(apName => {
            if (apName == key) {
              authTokens = {...authTokens, ...{[apName]: new AuthToken(data)}};
            }
            // this._principal.addProperty(data[apName].userInfo);
          });
          this._authSubject = this.getAuthSubject();
          this._authSubject.updateAuthToken(authTokens);
          this.writeAuthSubject(this._authSubject);
          return resp;
        })
      );
      subject = [...subject, ...[obse]];
      console.log('[refreshToken] subject: ', subject);
    });
    return forkJoin(subject);

  }

  logout(logoutUrl?: string, data?: any): Observable<boolean> {
    if (logoutUrl && logoutUrl !== '') {
      return (this.httpHandler.post(logoutUrl, data ? data : {}) as Observable<HandleContext>).pipe(
        tap(() => this._removeAuthentication()),
        map(() => true)
      );
    } else {
      this._removeAuthentication();
      return of(true);
    }
  }

  _removeAuthentication(): void {
    // this._principal = new Principal();
    this.removeAuthSubject();
    this.removeUrl();
    this.removeUrlMap();
  }

  writeUrl(loginUrl: string, refreshUrl: string | {[key: string]: string}): void {
    localStorage.setItem(`${this._apName}_LoginUrl`, loginUrl);
    if (typeof refreshUrl === 'string') {
      localStorage.setItem(`${this._apName}_RefreshUrl`, refreshUrl);
      return;
    }
    localStorage.setItem(`${this._apName}_RefreshUrl`, JSON.stringify(refreshUrl));
  }

  writeAPNameMapUrl(map:  {[key: string]: string}): void {
    localStorage.setItem(`${this._apName}_APMap`, JSON.stringify(map));
  }


  getLoginUrl(): string {
    const url = localStorage.getItem(`${this._apName}_LoginUrl`) || '';
    return url;
  }

  getRefreshUrl(): {[key: string]: string} {
    const url = localStorage.getItem(`${this._apName}_RefreshUrl`) || '';
    const jUrl = JSON.parse(url) ?? {};
    return jUrl;
  }

  getPrincipal(): Principal {
    const temp = localStorage.getItem(`${this._apName}_Principal`) ?? '';
    if (temp === '') {
      return this._principal;
    }
    this._principal.addProperty(JSON.parse(temp));
    return this._principal;
  }

  getAuthTokens(): {[key: string]: AuthToken} {
    const temp = localStorage.getItem(`${this._apName}_AuthenticationToken`) ?? '';
    if (temp === '') {
      return {};
    }
    const tokens = JSON.parse(temp);
    return tokens;
  }

  getAPNameMapUrl(): {[key: string]: string} {
    const temp = localStorage.getItem(`${this._apName}_APMap`) ?? '';
    if (temp === '') {
      return {};
    }
    const map = JSON.parse(temp);
    return map;
  }

  writeAuthSubject(authSubject: AuthSubject): void {
    localStorage.setItem(`${this._apName}_Principal`, JSON.stringify(authSubject.principal));
    localStorage.setItem(`${this._apName}_AuthenticationToken`, JSON.stringify(authSubject.authToken));
  }

  getAuthSubject(): AuthSubject {
    const principal = new Principal();
    principal.addProperty(JSON.parse(localStorage.getItem(`${this._apName}_Principal`) as string));
    const authToken = JSON.parse(localStorage.getItem(`${this._apName}_AuthenticationToken`) as string);
    const authSubject = new AuthSubject(principal, authToken);
    return authSubject;
  }

  removeAuthSubject(): void {
    localStorage.removeItem(`${this._apName}_Principal`);
    localStorage.removeItem(`${this._apName}_AuthenticationToken`);
  }

  removeUrl(): void {
    localStorage.removeItem(`${this._apName}_LoginUrl`);
    localStorage.removeItem(`${this._apName}_RefreshUrl`);
  }

  removeUrlMap(): void {
    localStorage.removeItem(`${this._apName}_APMap`);
  }


}
