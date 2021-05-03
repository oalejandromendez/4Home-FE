import { Injectable } from '@angular/core';
import { ServiceModel } from 'src/app/models/admin/service.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/service`);
  }

  post( service: ServiceModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/service`, { ...service });
  }

  put( service: ServiceModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/service/${id}`, { ...service });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/service/${id}`);
  }

  findByTypeAndWorking( type: string, workingDay: string) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/service/filter/type/${type}/workingday/${workingDay}`);
  }

}
