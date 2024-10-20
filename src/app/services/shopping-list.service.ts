// shopping-list.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private userShoppingListSource = new BehaviorSubject<{ ingredient: string; inFrigo: boolean }[]>([]);
  userShoppingList$ = this.userShoppingListSource.asObservable();

  updateUserShoppingList(list: { ingredient: string; inFrigo: boolean }[]) {
    this.userShoppingListSource.next(list);
  }

  getUserShoppingList() {
    return this.userShoppingListSource.value;
  }
}