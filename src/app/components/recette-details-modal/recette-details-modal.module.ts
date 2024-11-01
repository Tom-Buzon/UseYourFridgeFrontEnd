// src/app/recette-details-modal/recette-details-modal.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RecetteDetailsModalComponent } from './recette-details-modal.component';

@NgModule({
  declarations: [RecetteDetailsModalComponent],
  imports: [
    SharedModule],
  exports: [RecetteDetailsModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ajouter ceci pour reconnaître les éléments Ionic
})
export class RecetteDetailsModalModule {}
