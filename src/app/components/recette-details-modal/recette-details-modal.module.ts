// recette-details-modal.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RecetteDetailsModalComponent } from './recette-details-modal.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [RecetteDetailsModalComponent],
  imports: [
    SharedModule,
    IonicModule,
  ],
  exports: [RecetteDetailsModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RecetteDetailsModalModule {}
