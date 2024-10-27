// src/app/recette-details-modal/recette-details-modal.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // Importez IonicModule
import { RecetteDetailsModalComponent } from './recette-details-modal.component';

@NgModule({
  declarations: [RecetteDetailsModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule 
  ],
  exports: [RecetteDetailsModalComponent]
})
export class RecetteDetailsModalModule {}
