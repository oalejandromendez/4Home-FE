import { Injectable } from '@angular/core';
import { ServiceTypeModel } from 'src/app/models/admin/servicetype.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class ServicetypeService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/servicetype`);
  }

  post( servicetype: ServiceTypeModel ) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/servicetype`, { ...servicetype });
  }

  put( servicetype: ServiceTypeModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/servicetype/${id}`, { ...servicetype });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/servicetype/${id}`);
  }
}
