// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from 'src/environments/environment';

export interface User {
  id: number;
  username: string;
}



@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl =   "http://"+  environment.ipAdress+ ":3000/api/user";


  user: any;
  
 
  
  constructor(private http: HttpClient,
    private tokenStorage: TokenStorageService,) {

  }



  getUsernameById(id: number): Observable<any> {
   return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  
  getAllUsernameAndId(): Observable<any> {
    return this.http.get<User>(`${this.apiUrl}`);
   }
 
}