import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/roles`);
  }

  post( rol: any) {

    const rolesData = {
      ...rol
    };

    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/roles`, rolesData);
  }

  put( rol: any, id: string) {

    const rolData = {
      ...rol
    };

    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/roles/${id}`, rolData);

  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/roles/${id}`);
  }

  validateName(value: string) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/roles/filter/name/${value}`);
  }
}
