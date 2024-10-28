// src/app/services/recette.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recette {
  id: number;
  title: string;
  url: string;
  rate: number;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  difficulty: string;
  budget: string;
  people: number;
  prep_time: number;
  cooking_time: number;
  total_time: number;
  ingredients: { ingredient: string; unit: string; quantite: number }[];
  selected?: boolean; // Propriété pour la sélection des recettes
}

@Injectable({
  providedIn: 'root'
})
export class RecetteService {
  private baseUrl = 'http://192.168.178.53:3000/api';

  constructor(private http: HttpClient) {}

  getRecettes(lang: string): Observable<Recette[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<Recette[]>(`${this.baseUrl}/recetteformat`, { params });
  }

  // Récupérer les options de tag1
  getTag1Options(lang: string): Observable<string[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag1`, { params });
  }

  // Récupérer les options de tag2
  getTag2Options(lang: string): Observable<string[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag2`, { params });
  }

  // Récupérer les options de tag3
  getTag3Options(lang: string): Observable<string[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag3`, { params });
  }
}
