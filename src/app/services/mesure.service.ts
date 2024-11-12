// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Mesure } from '../models/types';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MesureService {

  private apiUrl = "http://" + environment.ipAdress + ':3000/api/mesures';

  constructor(private http: HttpClient) {

  }

  addMesure(ingredientName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { nom: ingredientName }, httpOptions);
  }

  getAllMesures(): Observable<any> {
    return this.http.get<Mesure[]>(`${this.apiUrl}`);
  }

}