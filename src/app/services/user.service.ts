// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl =   "http://"+  environment.ipAdress+ ":3000/api/user";

  constructor(private http: HttpClient) {

  }

  getUsernameById(id: number): Observable<any> {
   return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  
  getAllUsernameAndId(): Observable<any> {
    return this.http.get<User[]>(`${this.apiUrl}`);
   }
 
}