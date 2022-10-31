import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HandleContext } from '@cg/ng-httphandler';
import { LoginService } from '@home/services/login.service';

@Component({
  selector: 'app-redirect-create-ws',
  templateUrl: './redirect-create-ws.component.html',
  styleUrls: ['./redirect-create-ws.component.scss']
})
export class RedirectCreateWsComponent implements OnInit {

  sId: string = '';
  errorMsg: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
  ) { }

  ngOnInit(): void {
    this.sId = this.route.snapshot.queryParamMap.get('sid') ?? '';
    if (this.sId === '') {
      console.error('[RedirectCreateWsComponent]: Can not redirect to create workstage page. Because of the sessionId is empty.');
      return;
    }
    this.loginService.ssoCreatWsLogin(this.sId).subscribe({
      next: resp => {
        const dianthusParam = resp.data?.['dianthus'] ?? {};
        const createData = dianthusParam?.['createWsInfo'];
        this.router.navigate(['/page/create-ws-new'], {queryParams: createData});
      },
      error: (error: HandleContext) => {
        this.errorMsg = error.errorMessage;
      }
    });
    
  }


}
