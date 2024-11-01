import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { ShoppingListModalModule } from '../components/shopping-list-modal/shopping-list-modal.module';
import { SharedModule } from '../shared/shared.module';
import { HeaderModule } from '../components/header/header.module';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    SharedModule,
    HeaderModule,
    FormsModule,
    Tab2PageRoutingModule,
    ShoppingListModalModule
  ],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}