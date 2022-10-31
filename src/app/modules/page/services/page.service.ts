import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgConfigService } from '@cg/ng-config';
import { HandleContext, HttpClientOption, NgHttphandlerService } from '@cg/ng-httphandler';
import { LocalizationService } from '@cg/ng-localization';
import { Agreement } from '@page/models/agreement.model';
import { CuzWsCondition } from '@page/models/cuz-ws-condition.model';
import { AreaDept } from '@resolver/models/area-dept.model';
import { ResolverService } from '@resolver/services/resolver.service';
import { catchError, map, Observable, of, throwError } from 'rxjs';

export const httpOptions = {
  'Content-Type': 'application/json; charset=utf-8'
};


@Injectable()
export class PageService {

  _editorUrl = '';
  _agreementUrl = '';
  _cuzWsUrl = '';
  _signRoleUrl = '';
  _wsUrl = '';
  _changeWsUrl = '';
  _downloadUrl = '';
  _patientUrl = '';

  areaDepts: AreaDept[] = [];

  choosedAgreements: Agreement[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpHandler: NgHttphandlerService,
    private configService: NgConfigService,
    private translate: LocalizationService,
    private resolverService: ResolverService
  ) {
    const coreUrl = this.configService.get('coreUrl');
    const ezSignUrl = this.configService.get('1zSIGNUrl');
    this._editorUrl = this.configService.get('1zSIGNEditorUrl');
    this._cuzWsUrl = `${ezSignUrl}/rest/v2/workstage/cusdata`;
    this._agreementUrl = `${ezSignUrl}/rest/management/template`;
    this._signRoleUrl = `${ezSignUrl}/rest/management/metadata/signrole`;
    this._wsUrl = `${ezSignUrl}/rest/v2/workstage`;
    this._changeWsUrl = `${ezSignUrl}/rest/workstage`;
    this._downloadUrl = `${ezSignUrl}/rest/document`;
    this._patientUrl = `${coreUrl}/rest/patient`;
    
    this.areaDepts = this.resolverService.getAreaDept();
  }

  getAgreementPageList(page: { pageSize: number, pageIndex: number }) : Observable<HandleContext> {
    const temp = this.configService.get('templateList') as {
      templateName: string,
      templateUid: string
    }[];
    // Todo: 判斷是不是空的，如果是空的，呼叫第三方API
    if (temp.length === 0) {
      console.warn('[getAgreementPageList]: get agreement list response is empty.');
    }

    let agreementList:  {templateName: string, templateUid: string}[] = [];
    temp.forEach(template => {
      agreementList = [...agreementList, ...[template]];
    });

    return of(new HandleContext({errorCode: 0, errorMessage: 'success', data: {result : agreementList, total: 3}}));

    return (this.httpHandler.get(this._agreementUrl, {
      qParams: page,
      optionHeader: httpOptions
    }) as Observable<HandleContext>).pipe(
      catchError((error: HandleContext) => {
        if (error.status === 500) {
          error = new HandleContext({errorCode: -1, errorMessage: this.translate.get("Message.error.serverErrorMsg")});
        }
        return throwError(error);
      })
    );
  }

  createWsByCuzIdWithVal(cuzWsId: string, addition: { [key: string]: string | number }, workstageSignKey:string): Observable<HandleContext> {
    const url = `${ this._cuzWsUrl}/${cuzWsId}/full`;
    return (this.httpHandler.post(url, { 'addition_info': addition, 'workstageSignKey': workstageSignKey}, {
      optionHeader: httpOptions
    }) as Observable<HandleContext>).pipe(
      catchError((error: HandleContext) => {
        console.log(error);
        if (error.status === 500) {
          error = new HandleContext({errorCode: -1, errorMessage: this.translate.get("Message.error.serverErrorMsg")});
        }
        return throwError(error);
      })
    );
  }

  getOpenEditorUrl(wsId: string): string {
    let url = this._editorUrl;
    url += this.router.serializeUrl(
      this.router.createUrlTree(['/edit'], { queryParams: { wid: wsId } })
    );
    return url;
  }

  getPatientData(ptNO: string): Observable<HandleContext> {
    return (this.httpHandler.get(this._patientUrl, {
      qParams: { pno: ptNO },
      optionHeader: httpOptions
    }) as Observable<HandleContext>).pipe(
      catchError((error: HandleContext) => {
        if (error.status === 500) {
          error = new HandleContext({errorCode: -1, errorMessage: this.translate.get("Message.error.serverErrorMsg")});
        }
        return throwError(error);
      })
    );
  }

  getSignRoleList() : Observable<HandleContext> {
    return (this.httpHandler.get(this._signRoleUrl, {
      qParams: { pageSize: -1, pageIndex: -1 },
      optionHeader: httpOptions
    }) as Observable<HandleContext>).pipe(
      catchError((error: HandleContext) => {
        if (error.status === 500) {
          error = new HandleContext({errorCode: -1, errorMessage: this.translate.get("Message.error.serverErrorMsg")});
        }
        return throwError(error);
      })
    );
  }

  getCuzWsPageList(condition: CuzWsCondition, page: { pageSize: number, pageIndex: number }) : Observable<HandleContext> {
    return (this.httpHandler.get(this._wsUrl, {
      qParams: { ...condition, ...page },
      optionHeader: httpOptions
    }) as Observable<HandleContext>).pipe(
      catchError((error: HandleContext) => {
        if (error.status === 500) {
          error = new HandleContext({errorCode: -1, errorMessage: this.translate.get("Message.error.serverErrorMsg")});
        }
        return throwError(error);
      })
    );
  }

  downloadWS(workstageId: string) : Observable<unknown> {
    const url = `${this._downloadUrl}/${workstageId}`;
    return this.http.get(url, { params: { mode: 'download' }, responseType: 'blob' }).pipe(
      map(resp => {
        return resp;
      }),
      catchError(error => throwError(error))
    );
    // return (this.httpHandler.get(url, {
    //   qParams: { mode: 'download' },
    //   optionHeader: httpOptions,
    //   additionOption: {responseType: 'blob'}
    // }) as Observable<HandleContext>).pipe(
    //   catchError((error: HandleContext) => {
    //     if (error.status === 200) {
    //       return of(error);
    //     }
    //     if (error.status === 500) {
    //       error = new HandleContext({errorCode: -1, errorMessage: this.translate.get("Message.error.serverErrorMsg")});
    //       return throwError(error);
    //     }
    //     return throwError(error);
    //   })
    // );
  }

  /** POST: finish workstage by workstageId from the server */
  finishWorkstage(workstageId: string): Observable<any> {
    const url = `${this._changeWsUrl}/status`;
    const finishParam = {
      data : workstageId,
      op : 'finish',
      trans_info: {
        clientId: "",
        transactionId: "",
        returnWorkstageInfo: ""
      }
    };
    return (this.httpHandler.post(url, finishParam, {optionHeader: httpOptions}) as Observable<HandleContext[]>).pipe(
      catchError((error: HandleContext) => {
        let errors = [error];
        if (error.status === 500) {
          errors = [...[new HandleContext({errorCode: -1, errorMessage: this.translate.get("Message.error.serverErrorMsg")})]];
        }
        return throwError(errors);
      })
    );
  }

}
