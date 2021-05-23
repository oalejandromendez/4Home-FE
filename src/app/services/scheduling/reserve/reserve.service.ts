import { Injectable } from '@angular/core';
import { ReserveModel } from 'src/app/models/scheduling/reserve.mode';
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

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/reserve`);
  }

  getByCustomer(idCustomer: any) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/reserve/filter/customer/${idCustomer}`);
  }

  post( reserve: ReserveModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/reserve`, { ...reserve });
  }

  put( reserve: ReserveModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/reserve/${id}`, { ...reserve });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/reserve/${id}`);
  }

}
