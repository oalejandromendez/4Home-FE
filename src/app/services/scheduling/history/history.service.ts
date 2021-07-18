import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  url: string;

  constructor(
    private headers: HeaderService
  ) {
    this.url = environment.host;
  }

  post( filter: any) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/payment/filter/user`, { ...filter });
  }
}
