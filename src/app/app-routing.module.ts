import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SignupPage } from './pages/signup-page/signup.page';
import { AuthenticationGuard } from './helpers/authentication.guard';
import { FirsTimePage } from './pages/first-time-page/first-time.page';
import { FirstTimeGuard } from './helpers/firstTime.guard';
import { SigninPage } from './pages/signin-page/signin.page';

const routes: Routes = [

  {path: 'login',canActivate: [FirstTimeGuard], component: SigninPage},
  {path: 'register',canActivate: [FirstTimeGuard], component: SignupPage},
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
