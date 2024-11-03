// src/app/recette-details-modal/recette-details-modal.module.ts

import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [HeaderComponent],
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule
    ],
  exports: [HeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ajouter ceci pour reconnaître les éléments Ionic
})
export class HeaderModule {

  
}
