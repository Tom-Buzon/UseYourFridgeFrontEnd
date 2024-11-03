import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';

import { Tab1PageRoutingModule } from './tab1-routing.module';;
import { HeaderModule } from '../components/header-component/header.module';
import { TranslateModule } from '@ngx-translate/core';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderModule,
    Tab1PageRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    
  ],
  declarations: [Tab1Page]
})
export class Tab1PageModule {}


