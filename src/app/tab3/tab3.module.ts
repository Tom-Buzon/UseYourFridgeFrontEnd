import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Tab3PageRoutingModule } from './tab3-routing.module';
import { SharedModule } from '../shared/shared.module';
import { HeaderModule } from '../components/header/header.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    HeaderModule,
    Tab3PageRoutingModule
  ],
  declarations: [Tab3Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab3PageModule {}
