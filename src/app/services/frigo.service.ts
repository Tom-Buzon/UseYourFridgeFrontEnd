// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

export interface Ingredient {
  id: number;
  ingredients: string;
  // ajoutez d'autres propriétés si nécessaire
}

@Injectable({
  providedIn: 'root'
})
export class FrigoService {
  //private apiUrl = 'http://localhost:3000/api/frigo';
  private apiUrl = 'http://192.168.178.52:3000/api/frigo';

  private ingredientsSubject = new ReplaySubject<Ingredient[]>(1);
  ingredients$ = this.ingredientsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadIngredients();
  }

  loadIngredients() {
    this.http.get<Ingredient[]>(`${this.apiUrl}/ingredients`).subscribe(
      ingredients => {
        this.ingredientsSubject.next(ingredients);
      },
      error => console.error('Erreur lors du chargement des ingrédients', error)
    );
  }
  addIngredient(ingredientName: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/ingredients`, { ingredients: ingredientName }, { headers, responseType: 'text' })
      .pipe(
        tap(() => this.loadIngredients())
      );
  }

  getCurrentIngredients(): Observable<string[]> {
    console.log('getCurrentIngredients appelé');
    return this.ingredients$.pipe(
     // filter(ingredients => ingredients.length > 0), // Ajoutez cette ligne
      tap(ingredients => console.log('Ingrédients dans getCurrentIngredients:', ingredients)),
      map(ingredients => ingredients.map(ing => ing.ingredients))
    );
  }

  deleteIngredient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ingredients/${id}`).pipe(
      tap(() => this.loadIngredients())
    );
  }
}