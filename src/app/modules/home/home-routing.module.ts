import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '@home/pages/login/login.component';
import { RedirectCreateWsComponent } from './pages/redirect-create-ws/redirect-create-ws.component';
import { RedirectWsListComponent } from './pages/redirect-ws-list/redirect-ws-list.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', component: LoginComponent },
  { path: 'redirect-ws-list', component: RedirectWsListComponent },
  { path: 'redirect-create-ws', component: RedirectCreateWsComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
