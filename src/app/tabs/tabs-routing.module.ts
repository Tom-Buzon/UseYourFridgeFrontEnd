import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { FrigoListPage } from '../pages/frigo-list-page/frigo-list.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
  
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },

      {path: 'tab3',
      children: [
        {
          path: '',
          loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
        },
        {
          path: ':id',
          loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
        },
      ]
    },
    {path: 'frigo-list', component: FrigoListPage },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab2',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
