import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RecettesPage } from './recettes.page';
import { TabsPageRoutingModule } from '../../tabs/tabs-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,  // Assurez-vous que IonicModule est importé ici
    TabsPageRoutingModule 
  ],
  declarations: [RecettesPage]
})
export class RecettesPageModule {}