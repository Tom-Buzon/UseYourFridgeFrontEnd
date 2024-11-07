// src/app/services/recette.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Recette } from '../models/types';



@Injectable({
  providedIn: 'root'
})
export class RecetteService {
  private baseUrl = 'http://' + environment.ipAdress + ':3000/api/recetteformat';

  constructor(private http: HttpClient) {}

  getRecettes(lang: string): Observable<Recette[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<Recette[]>(`${this.baseUrl}`, { params }).pipe(
      map((recettes: Recette[]) =>
        recettes.map((recette: Recette) => {
          // Parse the images field if necessary
          if (typeof recette.images === 'string') {
            try {
              recette.images = this.parseImagesString(recette.images);
              console.log(`Recette ID: ${recette.id}, Parsed images:`, recette.images);
            } catch (e) {
              console.error('Error parsing images for recette', recette.id, e);
              recette.images = [];
            }
          } else if (!recette.images) {
            recette.images = [];
          }
          return recette;
        })
      )
    );
  }


  // Récupérer les options de tag1
  getTag1Options(lang: string): Observable<string[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<string[]>(`${this.baseUrl}/tags/tag1`, { params });
  }

  // Récupérer les options de tag2
  getTag2Options(lang: string): Observable<string[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<string[]>(`${this.baseUrl}/tags/tag2`, { params });
  }

  // Récupérer les options de tag3
  getTag3Options(lang: string): Observable<string[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<string[]>(`${this.baseUrl}/tags/tag3`, { params });
  }

  
  parseImagesString(imagesStr: string): string[] {
    // Remove the starting and ending brackets
    let str = imagesStr.trim();
    if (str.startsWith('[') && str.endsWith(']')) {
      str = str.substring(1, str.length - 1);
    }
  
    // Regular expression to match individual URLs
    const urlRegex = /'(.*?)'|"([^"]*)"/g;
    let match;
    const urls = [];
  
    while ((match = urlRegex.exec(str)) !== null) {
      const url = match[1] || match[2];
      urls.push(url);
    }
  
    return urls;
  }
}
