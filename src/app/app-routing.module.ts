import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '@shared-auth/services/auth-guard.service';
import { RedirectWsListComponent } from '@home/pages/redirect-ws-list/redirect-ws-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('@home/home.module').then(mod => mod.HomeModule)},
  { path: 'page', loadChildren: () => import('@page/page.module').then(m => m.PageModule),
  canLoad: [ AuthGuardService ] },
  { path: '', loadChildren: () => import('@home/home.module').then(mod => mod.HomeModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
