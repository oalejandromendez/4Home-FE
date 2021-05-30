import { Injectable } from '@angular/core';
import { ProfessionalModel } from 'src/app/models/admin/professional.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/professional`);
  }

  getId(id: string) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/professional/${id}`);
  }

  post( professional: ProfessionalModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/professional`, { ...professional });
  }

  put( professional: ProfessionalModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/professional/${id}`, { ...professional });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/professional/${id}`);
  }

  validateIdentification(value: string) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/professional/filter/identification/${value}`);
  }

  validateEmail(value: string) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/professional/filter/email`, {email: value});
  }

  checkAvailability(filter: any) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/professional/filter/availability`, { ...filter });
  }

}
