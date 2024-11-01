// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from 'src/environments/environment';

export interface Ingredient {
  id: number;
  ingredient: string;
  ingredient_en: string;
}



@Injectable({
  providedIn: 'root'
})
export class IngredientService {

  private apiUrl =  "http://"+  environment.ipAdress+ ':3000/api/ingredients';


  user: any;
  
 
  
  constructor(private http: HttpClient) {

  }




  
  getAllingredients(): Observable<any> {
    return this.http.get<Ingredient[]>(`${this.apiUrl}`);
   }
 
}