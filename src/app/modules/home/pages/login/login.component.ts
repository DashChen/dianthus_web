import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';
import { LoginService } from '@home/services/login.service';
import { StatusCode } from 'src/app/modules/shared/modules/shared/enums/status-code.enum';
import { BehaviorSubject } from 'rxjs';
import { AreaDept } from '@resolver/models/area-dept.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  STATUS_CODE: typeof StatusCode = StatusCode;


  alertMessage = '';
  loginForm: FormGroup;

  areaDepts: AreaDept[] = [];
  loginStatus$ = new BehaviorSubject<number>(StatusCode.INIT);

  constructor(
    private router: Router,
    private loginService: LoginService,
    private fb: FormBuilder,
    private translate: LocalizationService
  ) {
    this.loginForm = this.fb.group({
      loginAccount: ['', Validators.required],
      loginPwd: ['', Validators.required],
      areaDept: ['', Validators.required]
    });
    this.areaDepts = this.loginService.areaDepts;
  }

  ngOnInit(): void {
  }

  
  login(): void {
    this.alertMessage = '';

    if (this.loginForm.invalid) {
      return;
    }
    this.loginStatus$.next(StatusCode.LOADING);
    const loginValue = this.loginForm.value;

    this.loginService.login(loginValue.loginAccount, loginValue.loginPwd, loginValue.areaDept).subscribe({
      next: () => {        
        this.loginStatus$.next(StatusCode.SUCCESS);
        this.router.navigateByUrl('/page/home');
      },
      error: () => {
        this.loginStatus$.next(StatusCode.ERROR);
        this.alertMessage = this.translate.get('Message.error.login');
      }
    });
  }

}
