// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from 'src/environments/environment';
import { Frigo } from '../models/types';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class FrigoService {

  private apiUrl = "http://" + environment.ipAdress + ':3000/api/frigo';
  user: any;

  constructor(private http: HttpClient,private tokenStorage: TokenStorageService) {
    if (this.tokenStorage.getToken()) {
      this.user = this.tokenStorage.getUser();
    }
  }

  loadFrigos(): Observable<Frigo[]> {
    return this.http.get<Frigo[]>(`${this.apiUrl}/${this.user.id}`);
  }

  loadFrigosShared(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shared/${this.user.id}`);
  }

  getFrigoById(id: number): Observable<any> {
    return this.http.get<Frigo[]>(`${this.apiUrl}/${id}`);
  }

  addIngredientToFridge(name: string, quantity: string, frigoId: number | undefined): Observable<any> {
    return this.http.post(`${this.apiUrl}/ingredients`, { nom: name, quantity: quantity, frigoId: frigoId }, httpOptions);
  }

  addFrigo(frigoName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { nom: frigoName, userId: this.user.id }, httpOptions);
  }

  deleteIngredient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ingredients/${id}`);
  }
}