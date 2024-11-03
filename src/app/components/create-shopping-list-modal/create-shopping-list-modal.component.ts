// create-shopping-list-modal.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShoppingListService, CreateShoppingListPayload, ShoppingList, ShoppingItem } from '../../services/shopping-list.service';
import { ModalController } from '@ionic/angular';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-create-shopping-list-modal',
  templateUrl: './create-shopping-list-modal.component.html',
  styleUrls: ['./create-shopping-list-modal.component.scss']
})
export class CreateShoppingListModalComponent {
  @Output() listCreated = new EventEmitter<ShoppingList>();
  
  shoppingListForm: FormGroup;
  items: ShoppingItem[] = [];

  constructor(
    private fb: FormBuilder,
    public modalController: ModalController, // Changé en public
    private shoppingListService: ShoppingListService
  ) {
    this.shoppingListForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      scheduledDate: [null]
    });
  }

  addItem(ingredient: string, unit: string, quantite: number) {
    const newItem: ShoppingItem = {
      ingredient,
      unit,
      quantite,
      inFrigo: false
    };
    this.items.push(newItem);
  }

  createList() {
    if (this.shoppingListForm.invalid) {
      return;
    }

    const payload: CreateShoppingListPayload = {
      name: this.shoppingListForm.value.name,
      items: this.items,
      scheduledDate: this.shoppingListForm.value.scheduledDate
    };
    

    this.shoppingListService.createShoppingListWithName(payload)
      .pipe(
        tap((response: ShoppingList) => console.log('Response from server:', response))
      )
      .subscribe({
        next: (createdList) => {
          this.modalController.dismiss(createdList);
        },
        error: (error) => {
          console.error('Error creating shopping list:', error);
        }
      });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  resetForm() {
    this.shoppingListForm.reset();
    this.items = [];
  }
}