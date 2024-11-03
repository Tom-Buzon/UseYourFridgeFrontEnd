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
  private apiUrl2 =  "http://"+  environment.ipAdress+ ':3000/api/ingredients';

  private frigosSubject = new ReplaySubject<Frigo[]>(1);
  frigos$ = this.frigosSubject.asObservable();

  user: any;
  
  private ingredientsSubject = new ReplaySubject<Ingredient[]>(1);
  ingredients$ = this.ingredientsSubject.asObservable();
  
  constructor(private http: HttpClient,
    private tokenStorage: TokenStorageService,) {
    this.loadIngredients();
    this.loadFrigos().subscribe();
  }

  loadIngredients() {
    this.http.get<Ingredient[]>(`${this.apiUrl2}`).subscribe(
      ingredients => {
        console.log('Chargement des ingrédients depuis la base de données');
        // Process ingredients if necessary
      },
      error => console.error('Erreur lors du chargement des ingrédients', error)
    );
  }

  loadFrigos(): Observable<Frigo[]> {
    if (this.tokenStorage.getToken()) {
      this.user = this.tokenStorage.getUser();
    }
    return this.http.get<Frigo[]>(`${this.apiUrl}/${this.user.id}`).pipe(
      tap(frigos => this.frigosSubject.next(frigos))
    );
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
    return this.http.post(`${this.apiUrl2}`, { nom: ingredientName }, { headers, responseType: 'text' })
      .pipe(
        tap(() => this.loadIngredients())
      );
  }

  addIngredientToFridge(name: string,quantity: string,frigoId : number | undefined): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/ingredients`, { nom: name,quantity: quantity ,frigoId:frigoId}, { headers, responseType: 'text' })
      .pipe(
        tap(() => this.loadIngredients())
      );
  }

    
  addFrigo(frigoName: string): Observable<any> {
    if (this.tokenStorage.getToken()) {
      this.user = this.tokenStorage.getUser();
    }
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}`, { nom: frigoName, userId: this.user.id }, { headers, responseType: 'text' })
      .pipe(
        tap(() => this.loadIngredients())
      );
  }


  getCurrentIngredients(): Observable<Ingredient[]> {
    return this.frigos$.pipe(
      map(frigos => {
        const ingredientsSet = new Set<Ingredient>();
        frigos.forEach(frigo => {
          frigo.ingredients.forEach(ing => ingredientsSet.add(ing));
        });
        return Array.from(ingredientsSet);
      })
    );
  }


  deleteIngredient(id: number): Observable<any> {
    console.log(id);
    return this.http.delete(`${this.apiUrl}/ingredients/${id}`).pipe(
      tap(() => this.loadIngredients())
    );
  }
}