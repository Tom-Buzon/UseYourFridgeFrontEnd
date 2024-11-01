import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';



const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = "http://"+ environment.ipAdress+  ":3000/api/auth/";
  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl + 'signin', {
      username,
      password
    }, httpOptions);
  }

  register(username: string,  password: string): Observable<any> {
    return this.http.post(this.apiUrl + 'signup', {
      username,
      password
    }, httpOptions);
  }
}