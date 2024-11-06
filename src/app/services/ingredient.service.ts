// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Ingredient } from '../models/types';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class IngredientService {

  private apiUrl = "http://" + environment.ipAdress + ':3000/api/ingredients';

  constructor(private http: HttpClient) {

  }

  addIngredient(ingredientName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { nom: ingredientName }, httpOptions);
  }

  getAllingredients(): Observable<any> {
    return this.http.get<Ingredient[]>(`${this.apiUrl}`);
  }

}