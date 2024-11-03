import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { SharedModule } from '../shared/shared.module';
import { HeaderModule } from '../components/header/header.module';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    HeaderModule,
    Tab1PageRoutingModule,
    ReactiveFormsModule,
    
  ],
  declarations: [Tab1Page]
})
export class Tab1PageModule {}


