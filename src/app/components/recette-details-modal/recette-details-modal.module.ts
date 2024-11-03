// recette-details-modal.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RecetteDetailsModalComponent } from './recette-details-modal.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [RecetteDetailsModalComponent],
  imports: [
    IonicModule,
    TranslateModule,
  ],
  exports: [RecetteDetailsModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RecetteDetailsModalModule {}
