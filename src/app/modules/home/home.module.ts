import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './pages/login/login.component';
import { MaterialModule } from '@material//material.module';
import { NgLocalizationModule } from '@cg/ng-localization';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginService } from './services/login.service';
import { HomeRoutingModule } from './home-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ResolverModule } from '@resolver/resolver.module';
import { SharedModule } from '@shared/shared.module';
import { RedirectCreateWsComponent } from './pages/redirect-create-ws/redirect-create-ws.component';
import { RedirectWsListComponent } from './pages/redirect-ws-list/redirect-ws-list.component';





@NgModule({
  declarations: [
    LoginComponent,
    RedirectCreateWsComponent,
    RedirectWsListComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    NgLocalizationModule,
    FlexLayoutModule,
    ResolverModule,
    SharedModule
  ],
  providers: [
    LoginService
  ]
})
export class HomeModule { }
