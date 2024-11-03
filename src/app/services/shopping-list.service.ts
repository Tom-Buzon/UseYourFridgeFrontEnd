// src/app/services/shopping-list.service.ts

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';


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
  createdAt?: string; // Ajoutez cette ligne
  scheduledDate?: string | null; 
  userID?: number;
}

export interface CreateShoppingListPayload {
  name: string;
  items: ShoppingItem[];
  scheduledDate?: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private shoppingListsSubject = new BehaviorSubject<ShoppingList[]>([]);
  shoppingLists$ = this.shoppingListsSubject.asObservable();
  private apiUrl =  "http://"+  environment.ipAdress+ ':3000/api/shoppinglists';
  private STORAGE_KEY = 'shopping_lists';
  private shoppingLists: ShoppingList[] = [];

  constructor(private storage: Storage,private http: HttpClient) {
    this.loadInitialLists();
    this.init();
  }

  private loadInitialLists() {
    this.getShoppingLists().subscribe(lists => {
      this.shoppingListsSubject.next(lists);
    });
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

  createShoppingListWithName(payload: CreateShoppingListPayload): Observable<ShoppingList> {
    console.log('Service: Payload for createWithName:', payload);
    return this.http.post<ShoppingList>(`${this.apiUrl}/createWithName`, payload)
      .pipe(
        tap(
          response => console.log('Service: Response from createWithName:', response),
          error => console.error('Service: Error from createWithName:', error)
        )
      );
  }

  getShoppingLists(): Observable<ShoppingList[]> {
    return this.http.get<ShoppingList[]>(this.apiUrl);
  }

  // Méthode pour ajouter des items à une liste existante
  addItemsToList(listId: number, items: ShoppingItem[]): Observable<ShoppingList> {
    return this.http.post<ShoppingList>(`${this.apiUrl}/${listId}/addItems`, { items });
  }

  getUserShoppingLists(): ShoppingList[] {
    return this.shoppingLists;
  }

  addShoppingList(list: ShoppingList) {
    this.shoppingLists.push(list);
    this.saveLists();
  }

    // Supprimer une liste de courses
    deleteShoppingList(listId: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${listId}`);
    }
  
    // (Optionnel) Supprimer un item d'une liste de courses
    // Vous devrez implémenter cette méthode dans le backend
    deleteItemFromList(listId: number, itemId: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${listId}/items/${itemId}`);
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
