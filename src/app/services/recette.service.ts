import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Recette {
  id: number;
  titre: string;
  ingredients: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecetteService {
  //private apiUrl = 'http://localhost:3000/api/recettes'; // Assurez-vous que l'URL correspond à votre configuration
  private apiUrl = 'http://192.168.178.52:3000/api/recettes'; // Assurez-vous que l'URL correspond à votre configuration

  constructor(private http: HttpClient) { }

  getTitres(): Observable<Recette[]> {
    console.log('getTitres appelé');
    return this.http.get<Recette[]>(`${this.apiUrl}/titres-et-ingredients`).pipe(
      tap(
        data => console.log('Données reçues dans getTitres:', data),
        error => console.error('Erreur dans getTitres:', error)
      ),
      catchError(error => {
        console.error('Erreur attrapée dans getTitres:', error);
        return throwError('Erreur lors de la récupération des recettes');
      })
    );
  }

  getRecettesMatchingIngredients(ingredients: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/matching`, { ingredients });
  }

  getRecetteDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}