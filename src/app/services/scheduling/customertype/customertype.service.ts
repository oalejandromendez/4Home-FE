import { Injectable } from '@angular/core';
import { CustomerTypeModel } from 'src/app/models/scheduling/customertype.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class CustomertypeService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/customertype`);
  }

  post( customertype: CustomerTypeModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/customertype`, { ...customertype });
  }

  put( customertype: CustomerTypeModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/customertype/${id}`, { ...customertype });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/customertype/${id}`);
  }
}
