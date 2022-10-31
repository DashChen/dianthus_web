import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorTokenService {

  constructor() { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // token 可以來自任何地方
    const newRequest = req.clone({ setHeaders: { Authorization: 'bearer ' + sessionStorage.getItem('authSystem_token') } });
    return next.handle(newRequest);
  }
}
