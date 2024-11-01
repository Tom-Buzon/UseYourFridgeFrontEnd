import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ShoppingListModalComponent } from './shopping-list-modal.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  declarations: [ShoppingListModalComponent],
  exports: [ShoppingListModalComponent]
})
export class ShoppingListModalModule { }