import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageRoutingModule } from './page-routing.module';
import { CreateWsComponent } from './pages/create-ws/create-ws.component';
import { CreateWsAccordionComponent } from './components/create-ws-accordion/create-ws-accordion.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgLocalizationModule } from '@cg/ng-localization';
import { MaterialModule } from '@material//material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgHttphandlerModule, NgHttphandlerService, TransferErrorInterceptor } from '@cg/ng-httphandler';
import { AuthInterceptor } from '@shared-auth/interceptors/auth.interceptor';
import { AuthModule } from '@shared-auth/auth.module';
import { LoginedLayoutComponent } from './pages/logined-layout/logined-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { PageService } from './services/page.service';
import { ResolverModule } from '@resolver/resolver.module';
import { TableModule } from '@shared-table/table.module';
import { CreateWsResultComponent } from './components/create-ws-result/create-ws-result.component';
import { AccordionItemComponent } from './components/accordion-item/accordion-item.component';
import { SearchWsComponent } from './pages/search-ws/search-ws.component';
import { SearchWsAccordionComponent } from './components/search-ws-accordion/search-ws-accordion.component';
import { FinishWsDialogComponent } from './components/finish-ws-dialog/finish-ws-dialog.component';
import { CreateWsDialogComponent } from './components/create-ws-dialog/create-ws-dialog.component';
import { CreateWsNewComponent } from './pages/create-ws-new/create-ws-new.component';
import { SearchWsNewComponent } from './pages/search-ws-new/search-ws-new.component';
import { HttpInterceptorTokenService } from './services/http-interceptor-token.service';
import { HttpInterceptorErrorService } from './services/http-interceptor-error.service';
import { PageNewService } from './services/page-new.service';
import { NgSelect2Module } from 'ng-select2';





@NgModule({
  declarations: [
    CreateWsComponent,
    CreateWsAccordionComponent,
    LoginedLayoutComponent,
    HomeComponent,
    CreateWsResultComponent,
    AccordionItemComponent,
    SearchWsComponent,
    SearchWsAccordionComponent,
    FinishWsDialogComponent,
    CreateWsDialogComponent,
    CreateWsNewComponent,
    SearchWsNewComponent
  ],
  imports: [
    CommonModule,
    PageRoutingModule,
    MaterialModule,
    NgHttphandlerModule,
    ReactiveFormsModule,
    NgLocalizationModule,
    FlexLayoutModule,
    ResolverModule,
    TableModule,
    FormsModule,
    NgSelect2Module,
  ],
  //providers: [
  //  {
  //    provide: HTTP_INTERCEPTORS,
  //    useClass: HttpInterceptorTokenService,
  //    multi: true,
  //  },
  //  {
  //    provide: HTTP_INTERCEPTORS,
  //    useClass: HttpInterceptorErrorService,
  //    multi: true,
  //  }
  //],
  providers: [
    NgHttphandlerService,
    PageService,
    PageNewService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferErrorInterceptor,
      multi: true
    }
  ]
})
export class PageModule { }
