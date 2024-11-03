import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthPagePage } from './pages/auth-page/auth-page.page';
import { AuthenticationGuard } from './helpers/authentication.guard';

const routes: Routes = [

  {path: 'login', component: AuthPagePage},
  {path: '',  canActivate: [AuthenticationGuard] ,loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)},

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
