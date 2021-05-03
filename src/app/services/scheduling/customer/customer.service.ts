import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  url: string;

  constructor(
    private headers: HeaderService
  ) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/customer`);
  }

  post( user: any) {
    const userData = {
      ...user
    };
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/customer`, userData);
  }

  put( user: any, id: string) {
    const userData = {
      ...user
    };
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/customer/${id}`, userData);

  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/customer/${id}`);
  }

  validateIdentification(value: string) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/customer/filter/identification/${value}`);
  }

  find( filter: any) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/customer/find`, { ...filter });
  }

}
