// src/app/components/recette-ingredients-modal/recette-ingredients-modal.component.ts

import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Recette, ShoppingItem } from 'src/app/models/types';
import { ShoppingListService } from 'src/app/services/shopping-list.service';

@Component({
  selector: 'app-recette-ingredients-modal',
  templateUrl: './recette-ingredients-modal.component.html',
  styleUrls: ['./recette-ingredients-modal.component.scss'],
})
export class RecetteIngredientsModalComponent {
  @Input() recette!: Recette;
  numberOfPeople: number = 1;
  adjustedIngredients: any[] = [];

  constructor(
    private modalController: ModalController,
    private shoppingListService: ShoppingListService
  ) {}

  ngOnInit() {
    this.numberOfPeople = this.recette.people || 1;
    this.adjustIngredients();
  }

  adjustIngredients() {
    const basePeople = this.recette.people || 1;
    this.adjustedIngredients = this.recette.ingredients.map(ing => {
      const baseQuantity = ing.quantite !== null && ing.quantite !== undefined ? ing.quantite : 1;
      const adjustedQuantity = (baseQuantity / basePeople) * this.numberOfPeople;
      return {
        ...ing,
        adjustedQuantity: adjustedQuantity,
      };
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async addToShoppingList() {
    const shoppingList: ShoppingItem[] = this.adjustedIngredients.map(ing => ({
      ingredient: ing.ingredient,
      unit: ing.unit,
      quantite: ing.adjustedQuantity,
      inFrigo: false
    }));

/*     let lists = this.shoppingListService.getUserShoppingLists();
    if (lists.length === 0) {
      this.shoppingListService.addShoppingList({ name: 'Default List', items: [] });
      lists = this.shoppingListService.getUserShoppingLists();
    }

    await this.shoppingListService.addItemsToShoppingList(0, shoppingList); */
    this.modalController.dismiss();
  }
}
