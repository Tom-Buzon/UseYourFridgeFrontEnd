// src/app/recette-details-modal/recette-details-modal.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RecetteDetailsModalComponent } from './recette-details-modal.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [RecetteDetailsModalComponent],
  imports: [SharedModule],
  exports: [RecetteDetailsModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ajouter ceci pour reconnaître les éléments Ionic
})
export class RecetteDetailsModalModule {}
