import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { NgAuthService } from '@cg/ng-auth';
import { NgConfigModule, NgConfigService } from '@cg/ng-config';
import { NgLocalizationModule, LocalizationLoader, LocalizationHttpLoader } from '@cg/ng-localization';
import { DatePipe } from '@angular/common';
import { AuthModule } from '@shared-auth/auth.module';
import { NgHttphandlerModule, NgHttphandlerService } from '@cg/ng-httphandler';
import { NgSelect2Module } from 'ng-select2';


const getCoreUrl = (ngConfigService: NgConfigService) => {
  return ngConfigService.get('coreUrl');
};

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new LocalizationHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgConfigModule,
    NgSelect2Module,
    AuthModule.forRoot({
      apName: 'Dianthus'
    }),
    NgLocalizationModule.forRoot({
      loader: {
        provide: LocalizationLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    NgAuthService,
    DatePipe,
    {
      provide: 'BASE_URL',
      useFactory: getCoreUrl,
      deps: [NgConfigService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
