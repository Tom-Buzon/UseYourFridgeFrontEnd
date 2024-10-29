import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthComponentComponent } from './components/auth-component/auth-component.component';
import { AuthenticationGuard } from './helpers/authentication.guard';

const routes: Routes = [

  {path: 'login', component: AuthComponentComponent},
  {path: '',  canActivate: [AuthenticationGuard] ,loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)},

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
