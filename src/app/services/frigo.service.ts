// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from 'src/environments/environment';

export interface Frigo {
  id: number;
  nom: string;
  ingredients: Array<any>;
  // ajoutez d'autres propriétés si nécessaire
}

export interface Ingredient {
  id: number;
  nom: string;
  // ajoutez d'autres propriétés si nécessaire
}

@Injectable({
  providedIn: 'root'
})
export class FrigoService {

  private apiUrl =  "http://"+  environment.ipAdress+ ':3000/api/frigo';

  private frigosSubject = new ReplaySubject<Frigo[]>(1);
  frigos$ = this.frigosSubject.asObservable();

  user: any;
  
  private ingredientsSubject = new ReplaySubject<Ingredient[]>(1);
  ingredients$ = this.ingredientsSubject.asObservable();
  
  constructor(private http: HttpClient,
    private tokenStorage: TokenStorageService,) {
    this.loadIngredients();
    this.loadFrigos();
  }

  loadIngredients() {
    this.http.get<Ingredient[]>(`http://192.168.178.53:3000/api/ingredients`).subscribe(
      ingredients => {
        console.log("load frigo db");
        this.ingredientsSubject.next(ingredients);
      },
      error => console.error('Erreur lors du chargement des ingrédients', error)
    );
  }
  loadFrigos():Observable<any[]> {
    if (this.tokenStorage.getToken()) {
      this.user = this.tokenStorage.getUser();
    }
    return this.http.get<Frigo[]>(`${this.apiUrl}/${this.user.id}`);
  
  }
  loadFrigosShared():Observable<any> {
    if (this.tokenStorage.getToken()) {
      this.user = this.tokenStorage.getUser();
    }
    return this.http.get<any>(`${this.apiUrl}/shared/${this.user.id}`);
  
  }

  getFrigoById(id: number): Observable<any> {
   return this.http.get<Frigo[]>(`${this.apiUrl}/${id}`);
  }


  addIngredient(ingredientName: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`http://192.168.178.53:3000/api/ingredients`, { nom: ingredientName }, { headers, responseType: 'text' })
      .pipe(
        tap(() => this.loadIngredients())
      );
  }

    
  addFrigo(frigoName: string): Observable<any> {
    if (this.tokenStorage.getToken()) {
      this.user = this.tokenStorage.getUser();
    }
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`http://192.168.178.53:3000/api/frigo`, { nom: frigoName, userId: this.user.id }, { headers, responseType: 'text' })
      .pipe(
        tap(() => this.loadIngredients())
      );
  }


  getCurrentIngredients(): Observable<any[]> {
    console.log('getCurrentIngredients appelé');
    return this.frigos$.pipe(
     // filter(ingredients => ingredients.length > 0), // Ajoutez cette ligne
      tap(frigos => console.log('Ingrédients dans getCurrentIngredients:', frigos)),
      map(frigos => frigos.map(ing => ing.ingredients))
    );
  }

  deleteIngredient(id: number): Observable<any> {
    console.log(id);
    return this.http.delete(`${this.apiUrl}/ingredients/${id}`).pipe(
      tap(() => this.loadIngredients())
    );
  }
}