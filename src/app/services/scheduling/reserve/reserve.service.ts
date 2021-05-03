import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class ReserveService {

  url: string;

  constructor(
    private headers: HeaderService
  ) {
    this.url = environment.host;
  }

  getByCustomer(idCustomer: any) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/reserve/filter/customer/${idCustomer}`);
  }

}
