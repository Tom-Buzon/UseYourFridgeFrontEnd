import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FrigoService } from '../services/frigo.service';

@Component({
  selector: 'app-shopping-list-modal',
  templateUrl: './shopping-list-modal.component.html',
  styleUrls: ['./shopping-list-modal.component.scss'],
})
export class ShoppingListModalComponent {
  @Input() shoppingList: { ingredient: string; inFrigo: boolean }[] = [];

  constructor(
    private modalController: ModalController,
    private frigoService: FrigoService
  ) {}

  ngOnInit() {
    
    this.updateShoppingListStatus();
  }

  updateShoppingListStatus() {
    this.frigoService.getCurrentIngredients().subscribe(frigoIngredients => {
      this.shoppingList.forEach(item => {
        item.inFrigo = frigoIngredients.some(frigoItem => 
          frigoItem.toLowerCase() === item.ingredient.toLowerCase()
        );
      });
    });
  }

  addToFridge(ingredient: string) {
    this.frigoService.addIngredient(ingredient).subscribe(
      () => {
        console.log(`Ingrédient ${ingredient} ajouté au frigo`);
        this.updateShoppingListStatus();
      },
      error => console.error(`Erreur lors de l'ajout de l'ingrédient ${ingredient} au frigo`, error)
    );
  }

  closeModal(action: string) {
    this.modalController.dismiss({
      action: action
    });
  }
}