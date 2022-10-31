import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { NgHttphandlerService, TransferErrorInterceptor } from '@cg/ng-httphandler';
import { AuthGuardService } from './services/auth-guard.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TimeoutDialogComponent } from './components/timeout-dialog/timeout-dialog.component';
import { MaterialModule } from '@material//material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgLocalizationModule } from '@cg/ng-localization';

export const AUTH_CONFIG = new InjectionToken<{apName: string}>('AUTH_CONFIG');

@NgModule({
  declarations: [
    TimeoutDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    NgLocalizationModule,
  ],
  providers: [
    NgHttphandlerService,
    //AuthService,
    //AuthGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferErrorInterceptor,
      multi: true
    }
  ]
})
export class AuthModule {
  static forRoot(config: {apName: string}): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        AuthService,
        AuthGuardService,
        { provide: AUTH_CONFIG, useValue: config }
      ]
    };
  }
}
