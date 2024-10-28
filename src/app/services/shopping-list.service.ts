// src/app/services/shopping-list.service.ts
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface ShoppingItem {
  ingredient: string;
  unit: string;
  quantite: number;
  inFrigo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private STORAGE_KEY = 'shopping_list';
  private shoppingList: ShoppingItem[] = [];

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
    const storedList = await this.storage.get(this.STORAGE_KEY);
    if (storedList) {
      this.shoppingList = storedList;
      console.log('Liste de courses chargée depuis le stockage:', this.shoppingList);
    } else {
      console.log('Aucune liste de courses trouvée dans le stockage.');
    }
  }

  // Ajouter des ingrédients à la liste de courses
  async addIngredientsToShoppingList(newItems: ShoppingItem[]) {
    console.log('Ajout de nouveaux ingrédients à la liste de courses:', newItems);
    // Fusionner les nouvelles entrées avec les existantes
    newItems.forEach(newItem => {
      const existingItem = this.shoppingList.find(item => 
        item.ingredient === newItem.ingredient && item.unit === newItem.unit
      );
      if (existingItem) {
        existingItem.quantite += newItem.quantite;
        console.log(`Quantité mise à jour pour ${newItem.ingredient} (${newItem.unit}): ${existingItem.quantite}`);
      } else {
        this.shoppingList.push(newItem);
        console.log(`Ajouté ${newItem.ingredient} (${newItem.unit}): ${newItem.quantite}`);
      }
    });
    await this.storage.set(this.STORAGE_KEY, this.shoppingList);
    console.log('Liste de courses mise à jour:', this.shoppingList);
  }

  // Récupérer la liste de courses
  getUserShoppingList(): ShoppingItem[] {
    console.log('Récupération de la liste de courses depuis le service:', this.shoppingList);
    return this.shoppingList;
  }

  // Effacer la liste de courses
  async clearShoppingList() {
    console.log('Effacement de la liste de courses précédente.');
    this.shoppingList = [];
    await this.storage.remove(this.STORAGE_KEY);
    console.log('Liste de courses effacée.');
  }

  // Mettre à jour un élément de la liste
  async updateShoppingItem(index: number, updatedItem: ShoppingItem) {
    if (this.shoppingList[index]) {
      this.shoppingList[index] = updatedItem;
      await this.storage.set(this.STORAGE_KEY, this.shoppingList);
      console.log(`Élément mis à jour à l'index ${index}:`, updatedItem);
    }
  }
}
