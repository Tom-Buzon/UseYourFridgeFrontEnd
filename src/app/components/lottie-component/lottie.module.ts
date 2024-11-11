// src/app/recette-details-modal/recette-details-modal.module.ts

import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LottieComponent } from 'ngx-lottie';
import { MyLottieComponent } from './lottie.component';

@NgModule({
  declarations: [MyLottieComponent],
  imports: [
    IonicModule,
    CommonModule,
    LottieComponent,
    TranslateModule
    ],
  exports: [MyLottieComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ajouter ceci pour reconnaître les éléments Ionic
})
export class LottieModule {

  
}
