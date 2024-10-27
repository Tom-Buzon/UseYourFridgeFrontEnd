import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getRecettes(): Observable<Recette[]> {
    return this.http.get<Recette[]>(`${this.baseUrl}/recetteformat`);
  }

  // Récupérer les options de tag1
  getTag1Options(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag1`);
  }

  // Récupérer les options de tag2
  getTag2Options(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag2`);
  }

  // Récupérer les options de tag3
  getTag3Options(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag3`);
  }

  // Optionnel : Si vous souhaitez effectuer le filtrage côté serveur
  // getFilteredRecettes(tag1: string | null, tag2: string | null, tag3: string | null, searchTerm: string): Observable<Recette[]> {
  //   let params = new HttpParams();
    
  //   if (tag1) params = params.set('tag1', tag1);
  //   if (tag2) params = params.set('tag2', tag2);
  //   if (tag3) params = params.set('tag3', tag3);
  //   if (searchTerm) params = params.set('searchTerm', searchTerm);
    
  //   return this.http.get<Recette[]>(`${this.baseUrl}/recetteformat/filter`, { params });
  // }
}
