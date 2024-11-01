// src/app/recette-details-modal/recette-details-modal.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [HeaderComponent],
  imports: [
    SharedModule],
  exports: [HeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ajouter ceci pour reconnaître les éléments Ionic
})
export class HeaderModule {

  
}
