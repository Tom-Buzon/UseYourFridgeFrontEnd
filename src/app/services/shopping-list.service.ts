import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private userShoppingList: { ingredient: string; unit: string; quantite: number; inFrigo: boolean }[] = [];

  constructor() {}

  /**
   * Récupérer la liste de courses de l'utilisateur
   */
  getUserShoppingList() {
    return this.userShoppingList;
  }

  /**
   * Ajouter des ingrédients à la liste de courses de l'utilisateur
   * @param ingredients Array d'ingrédients à ajouter
   */
  addIngredientsToShoppingList(ingredients: { ingredient: string; unit: string; quantite: number; inFrigo: boolean }[]) {
    ingredients.forEach(newItem => {
      const existingItem = this.userShoppingList.find(item => 
        item.ingredient.toLowerCase() === newItem.ingredient.toLowerCase() && 
        item.unit === newItem.unit
      );
      if (existingItem) {
        existingItem.quantite += newItem.quantite;
      } else {
        this.userShoppingList.push({ ...newItem });
      }
    });
  }

  /**
   * Mettre à jour un ingrédient dans la liste de courses
   * @param ingredient Nom de l'ingrédient
   * @param inFrigo Statut d'inventaire
   */
  updateIngredientStatus(ingredient: string, inFrigo: boolean) {
    const item = this.userShoppingList.find(i => i.ingredient.toLowerCase() === ingredient.toLowerCase());
    if (item) {
      item.inFrigo = inFrigo;
    }
  }

  /**
   * Vider la liste de courses
   */
  clearShoppingList() {
    this.userShoppingList = [];
  }

  /**
   * Sauvegarder la liste de courses (implémenter selon vos besoins, par exemple avec LocalStorage ou une base de données)
   */
  saveShoppingList() {
    // Implémenter la logique de sauvegarde
  }
}



//export class ShoppingListService {
//  private userShoppingListSource = new BehaviorSubject<{ ingredient: string; inFrigo: boolean }[]>([]);
//  userShoppingList$ = this.userShoppingListSource.asObservable();
//
//  updateUserShoppingList(list: { ingredient: string; inFrigo: boolean }[]) {
//    this.userShoppingListSource.next(list);
//  }
//
//  getUserShoppingList() {
//    return this.userShoppingListSource.value;
//  }
//}