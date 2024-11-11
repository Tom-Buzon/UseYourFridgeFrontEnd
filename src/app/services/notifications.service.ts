// src/app/services/recette.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(private http: HttpClient) { }

  public getData(): Observable<any> {
    return this.http.get<any>('./assets/notifications.json');
  }
}
