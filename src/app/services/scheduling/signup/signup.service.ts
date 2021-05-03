import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  customerType() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/singup/customertype`);
  }

  validateIdentification(value: string) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/singup/customer/filter/identification/${value}`);
  }

  validateEmail(value: string) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/singup/user/filter/email`, {email: value});
  }

  post( user: any ) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/singup`, { ...user });
  }

}
