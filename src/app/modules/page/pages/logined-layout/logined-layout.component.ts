import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared-auth/services/auth.service';

@Component({
  selector: 'app-logined-layout',
  templateUrl: './logined-layout.component.html',
  styleUrls: ['./logined-layout.component.scss']
})
export class LoginedLayoutComponent implements OnInit {

  loginUserName = '';
  areaDept = '';
  employeeId = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.loginUserName = this.authService.getPrincipal()['cname'] as string;
    this.areaDept = this.authService.getPrincipal()['areaDept'] as string;
    this.employeeId = this.authService.getPrincipal()['employeeId'] as string;
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout().subscribe(
      () => {
        this.router.navigate(['/home']);
      }
    )
  }

}
