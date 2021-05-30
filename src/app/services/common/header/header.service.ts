import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(private http: HttpClient) { }

  get(token: string, url: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      Accept: 'application/json'
    });
    return this.http.get(url, { headers });
  }

  post(token: string, url: string, data: any ): Observable<any>  {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      'X-Requested-With': 'XMLHttpRequest'
    });
    return this.http.post(url, data, {headers});
  }

  patch(token: string, url: string, data: any ): Observable<any>  {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      'X-Requested-With': 'XMLHttpRequest'
    });
    return this.http.patch(url, data, {headers});
  }

  put(token: string, url: string, data: any ): Observable<any>  {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      'X-Requested-With': 'XMLHttpRequest'
    });
    return this.http.put(url, data, {headers});
  }

  delete(token: string, url: string): Observable<any>  {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      'X-Requested-With': 'XMLHttpRequest'
    });

    return this.http.delete(url, {headers});
  }
}
