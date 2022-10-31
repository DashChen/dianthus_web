import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HandleContext } from '@cg/ng-httphandler';
import { LoginService } from '@home/services/login.service';

@Component({
  selector: 'app-redirect-ws-list',
  templateUrl: './redirect-ws-list.component.html',
  styleUrls: ['./redirect-ws-list.component.scss']
})
export class RedirectWsListComponent implements OnInit {

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
      console.error('[RedirectWsListComponent]: Can not redirect to Workstage list search page. Because of the sessionId is empty.');
      return;
    }
    this.loginService.ssoCreatWsLogin(this.sId).subscribe({
      next: resp => {
        const dianthusParam = resp.data?.['dianthus'] ?? {};
        const wsInfo = dianthusParam?.['wsListInfo'];
        this.router.navigate(['/page/search-ws-new'], {queryParams: wsInfo});
      },
      error: (error: HandleContext) => {
        this.errorMsg = error.errorMessage;
      }
    });
    
  }

}
