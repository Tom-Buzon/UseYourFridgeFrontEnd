import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthPagePage } from './pages/auth-page/auth-page.page';
import { AuthenticationGuard } from './helpers/authentication.guard';
import { FirsTimePage } from './pages/first-time-page/first-time.page';
import { FirstTimeGuard } from './helpers/firstTime.guard';

const routes: Routes = [

  {path: 'login',canActivate: [FirstTimeGuard], component: AuthPagePage},
  {path: 'firstTime', component: FirsTimePage},

  {path: '',  canActivate: [AuthenticationGuard,FirstTimeGuard] ,loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)},

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
