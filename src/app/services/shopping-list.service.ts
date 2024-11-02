// src/app/services/shopping-list.service.ts

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';


export interface ShoppingItem {
  ingredient: string;
  unit: string | null;
  quantite: number | string | null;
  inFrigo: boolean;
}

export interface ShoppingList {
  id?: number;
  name: string;
  items: ShoppingItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private apiUrl =  "http://"+  environment.ipAdress+ ':3000/api/shoppinglists';
  private STORAGE_KEY = 'shopping_lists';
  private shoppingLists: ShoppingList[] = [];

  constructor(private storage: Storage,private http: HttpClient) {
    this.init();
  }

  async init() {
    await this.storage.create();
    const storedLists = await this.storage.get(this.STORAGE_KEY);
    if (storedLists) {
      this.shoppingLists = storedLists;
      console.log('Listes de courses chargées depuis le stockage:', this.shoppingLists);
    } else {
      console.log('Aucune liste de courses trouvée dans le stockage.');
    }
  }

  createShoppingList(items: ShoppingItem[]): Observable<any> {
    return this.http.post(this.apiUrl, { items });
  }

  getShoppingLists(): Observable<ShoppingList[]> {
    return this.http.get<ShoppingList[]>(this.apiUrl);
  }

  getUserShoppingLists(): ShoppingList[] {
    return this.shoppingLists;
  }

  addShoppingList(list: ShoppingList) {
    this.shoppingLists.push(list);
    this.saveLists();
  }

  deleteShoppingList(index: number) {
    this.shoppingLists.splice(index, 1);
    this.saveLists();
  }

  async addItemsToShoppingList(listIndex: number, newItems: ShoppingItem[]) {
    const list = this.shoppingLists[listIndex];
    if (list) {
      newItems.forEach(newItem => {
        const existingItem = list.items.find(item =>
          item.ingredient === newItem.ingredient && item.unit === newItem.unit
        );
        if (existingItem) {
    //      existingItem.quantite += newItem.quantite;
        } else {
          list.items.push(newItem);
        }
      });
      this.saveLists();
    }
  }

  clearShoppingList(listIndex: number) {
    if (this.shoppingLists[listIndex]) {
      this.shoppingLists[listIndex].items = [];
      this.saveLists();
    }
  }

  private async saveLists() {
    await this.storage.set(this.STORAGE_KEY, this.shoppingLists);
  }
}
