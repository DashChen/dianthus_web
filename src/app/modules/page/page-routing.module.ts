import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateWsComponent } from '@page/pages/create-ws/create-ws.component';
import { AuthGuardService } from '@shared-auth/services/auth-guard.service';
import { CreateWsNewComponent } from './pages/create-ws-new/create-ws-new.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginedLayoutComponent } from './pages/logined-layout/logined-layout.component';
import { SearchWsNewComponent } from './pages/search-ws-new/search-ws-new.component';
import { SearchWsComponent } from './pages/search-ws/search-ws.component';

const routes: Routes = [
  { path: '',
    component: LoginedLayoutComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      { path: 'create-ws',
        component: CreateWsComponent,
      },
      { path: 'search-ws',
        component: SearchWsComponent,
      },
      {
        path: 'create-ws-new',
        component: CreateWsNewComponent,
      },
      {
        path: 'search-ws-new',
        component: SearchWsNewComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRoutingModule { }
