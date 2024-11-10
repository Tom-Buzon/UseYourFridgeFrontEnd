// src/app/services/shopping-list.service.ts

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ShoppingList, ShoppingItem, CreateShoppingListPayload } from '../models/types';
import { TokenStorageService } from './token-storage.service';




@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {

  private apiUrl =  "http://"+  environment.ipAdress+ ':3000/api/shoppinglists';
  user: any;

  constructor(private storage: Storage,private http: HttpClient, private tokenStorage: TokenStorageService) {

    if (this.tokenStorage.getToken()) {
      this.user = this.tokenStorage.getUser();
    }
  }



  createShoppingList(items: ShoppingItem[]): Observable<any> {
    return this.http.post(this.apiUrl, { items });
  }

  createShoppingListWithName(payload: CreateShoppingListPayload): Observable<ShoppingList> {
    console.log('Service: Payload for createWithName:', payload);
    payload.userId = this.user.id
    return this.http.post<ShoppingList>(`${this.apiUrl}/createWithName`, payload)
      .pipe(
        tap(
          response => console.log('Service: Response from createWithName:', response),
          error => console.error('Service: Error from createWithName:', error)
        )
      );
  }

  getShoppingLists(): Observable<ShoppingList[]> {
    const userId = this.user.id;
    return this.http.get<ShoppingList[]>(`${this.apiUrl}/${userId}`);
  }

  // Méthode pour ajouter des items à une liste existante
  addItemsToList(listId: number, items: ShoppingItem[]): Observable<ShoppingList> {
    return this.http.post<ShoppingList>(`${this.apiUrl}/${listId}/addItems`, { items });
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



}
