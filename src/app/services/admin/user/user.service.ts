import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url: string;

  constructor(
    private headers: HeaderService
  ) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/user`);
  }

  getById( id: string) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/user/${id}`);
  }

  post( user: any) {
    const userData = {
      ...user
    };
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/user`, userData);
  }

  put( user: any, id: string) {
    const userData = {
      ...user
    };
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/user/${id}`, userData);

  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/user/${id}`);
  }

  validateEmail(value: string) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/user/filter/email`, {email: value});
  }

  permissions() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/user/permissions`);
  }

  profile( user: any, id: string) {
    const userData = {
      ...user
    };
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/user/profile/${id}`, userData);
  }
}
