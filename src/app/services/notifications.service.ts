// src/app/services/recette.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from './token-storage.service';

import { Notification } from '../models/types';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  
  user: any;
  private apiUrl = "http://" + environment.ipAdress + ':3000/api/notifications';
  constructor(private http: HttpClient,private tokenStorage: TokenStorageService) {
    if (this.tokenStorage.getToken()) {
      this.user = this.tokenStorage.getUser();
    }
  }

  loadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${this.user.id}`);
  }



  addNotification(frigoName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { nom: frigoName, userId: this.user.id }, httpOptions);
  }
}
