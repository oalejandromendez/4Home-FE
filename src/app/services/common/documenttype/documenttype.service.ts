import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../header/header.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentTypeService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/documenttype`);
  }

  getWithoutAuthentication() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/singup/documenttype`);
  }
}
