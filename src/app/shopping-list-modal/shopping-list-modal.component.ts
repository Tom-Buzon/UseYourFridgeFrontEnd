// shopping-list-modal.component.ts
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FrigoService } from '../services/frigo.service';
import { ShoppingListService, ShoppingItem } from '../services/shopping-list.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-list-modal',
  templateUrl: './shopping-list-modal.component.html',
  styleUrls: ['./shopping-list-modal.component.scss'],
})
export class ShoppingListModalComponent implements OnInit, OnDestroy {
  @Input() shoppingList: ShoppingItem[] = []; // Mise à jour du type

  private frigoSubscription!: Subscription;

  constructor(
    private modalController: ModalController,
    private frigoService: FrigoService,
    private shoppingListService: ShoppingListService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.refreshShoppingList();
    this.subscribeToFrigoChanges();
  }

  ngOnDestroy() {
    if (this.frigoSubscription) {
      this.frigoSubscription.unsubscribe();
    }
  }

  /**
   * Souscrire aux changements des ingrédients du frigo
   */
  subscribeToFrigoChanges() {
    this.frigoSubscription = this.frigoService.ingredients$.subscribe(frigoIngredients => {
      this.shoppingList.forEach(item => {
        item.inFrigo = frigoIngredients.some(frigoItem => 
          frigoItem.ingredients.toLowerCase() === item.ingredient.toLowerCase()
        );
      });
      this.cdr.detectChanges(); // Forcer la détection des changements
    });
  }

  /**
   * Ajouter un ingrédient au frigo
   * @param ingredient L'ingrédient à ajouter
   */
  addToFridge(ingredient: string) {
    this.frigoService.addIngredient(ingredient).subscribe(
      () => {
        console.log(`Ingrédient ${ingredient} ajouté au frigo`);
        // La souscription prendra en charge la mise à jour
      },
      error => console.error(`Erreur lors de l'ajout de l'ingrédient ${ingredient} au frigo`, error)
    );
  }

  /**
   * Fermer le modal avec une action spécifique
   * @param action L'action à renvoyer
   */
  closeModal(action: string) {
    this.modalController.dismiss({
      action: action
    });
  }

  /**
   * Rafraîchir la liste de courses en récupérant les données du service
   */
  refreshShoppingList() {
    this.shoppingList = this.shoppingListService.getUserShoppingList();
    // La souscription mettra à jour inFrigo
  }
}
