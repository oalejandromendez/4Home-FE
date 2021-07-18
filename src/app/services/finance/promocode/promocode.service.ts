import { Injectable } from '@angular/core';
import { PromocodeModel } from 'src/app/models/finance/promocode.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class PromocodeService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/promocodes`);
  }

  post( promocode: PromocodeModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/promocodes`, { ...promocode });
  }

  patch( code: string ) {
    return this.headers.patch(sessionStorage.getItem('token'), `${ this.url}/api/promocodes/disable`, { code });
  }

  check( code: string ) {
    return this.headers.patch(sessionStorage.getItem('token'), `${ this.url}/api/promocodes/check`, { code });
  }

}
