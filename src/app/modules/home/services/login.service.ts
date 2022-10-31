import { Injectable } from '@angular/core';

import { NgConfigService } from '@cg/ng-config';
import { HandleContext } from '@cg/ng-httphandler';
import { AreaDept } from '@resolver/models/area-dept.model';
import { ResolverService } from '@resolver/services/resolver.service';
import { AuthService } from '@shared-auth/services/auth.service';
import { catchError, iif, Observable, of, switchMap, tap, throwError } from 'rxjs';

@Injectable()
export class LoginService {

  _loginUrl = '';
  _ssoUrl = '';
  _refreshUrls: {[key: string]: string} = {};
  _apNameMap: {[key: string]: string} = {};

  areaDepts: AreaDept[] = [];

  constructor(
    private authService: AuthService,
    private configService: NgConfigService,
    private resolverService: ResolverService
  ) {
    const coreUrl = this.configService.get('coreUrl');
    const ezSignUrl = this.configService.get('1zSIGNUrl');
    this._apNameMap = this.configService.get('apNameMap') as {[key: string]: string};
    this._loginUrl = `${coreUrl}/rest/token/login`;
    this._ssoUrl = `${coreUrl}/rest/sso/login`;
    Object.entries(this._apNameMap).forEach(([key, value]) => {
      if (ezSignUrl.includes(value)) {
        this._refreshUrls = {...this._refreshUrls, ...{[key]: `${ezSignUrl}/rest/token/refresh`}};
      }
      else {
        this._refreshUrls = {...this._refreshUrls, ...{[key]: `${coreUrl}/rest/token/refresh`}};
      }
    });
    this.areaDepts = this.resolverService.getAreaDept();
  }

  login(account: string, pwd: string, areaDept: string): Observable<HandleContext> {
    const credential = { account: account, pwd: pwd, areaDept: areaDept };    
    return this.authService.login(this._loginUrl, this._refreshUrls, credential, {urlMap: this._apNameMap}) as Observable<HandleContext>;
  }

  ssoCreatWsLogin(sId: string): Observable<HandleContext> {
    const credential = {sessionId: sId};
    return this.authService.login(this._ssoUrl, this._refreshUrls, credential, {urlMap: this._apNameMap}) as Observable<HandleContext>;
  }

}


