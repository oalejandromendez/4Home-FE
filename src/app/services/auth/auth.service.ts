import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthModel } from 'src/app/models/auth/auth.model';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  host: string;
  token: string;

  constructor(private http: HttpClient) {
    this.host = environment.host;
    this.readToken();
  }

  login(user: AuthModel) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.host}/api/auth/login`, { ...user }, { headers }).pipe(map((resp: any) => {
      this.saveToken(resp);
      return resp;
    })
    );
  }

  private saveToken(user: any) {
    this.token = user.access_token;
    sessionStorage.setItem('token', user.access_token);
    sessionStorage.setItem('expires', user.expires_at);
    sessionStorage.setItem('user', JSON.stringify(user.user));
  }

  readToken() {
    if (sessionStorage.getItem('token')) {
      this.token = sessionStorage.getItem('token');
    } else {
      this.token = '';
    }
  }

  auth(): boolean {
    if (this.token.length < 30) {
      return false;
    }
    const expires = new Date(sessionStorage.getItem('expires'));
    if (expires > new Date()) {
      return true;
    } else {
      return false;
    }
  }

  authUser() {
    if (sessionStorage.getItem('user')) {
      return JSON.parse(sessionStorage.getItem('user'));
    } else {
      return false;
    }
  }

  logout() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('tokenqm'),
      Accept: 'application/json'
    });
    return this.http.get(`${this.host}/api/auth/logout`, { headers });
  }
}
