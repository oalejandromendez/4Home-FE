import { Injectable } from '@angular/core';
import { WorkingDayModel } from 'src/app/models/admin/workingday.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class WorkingdayService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/workingday`);
  }

  post( workingday: WorkingDayModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/workingday`, { ...workingday });
  }

  put( workingday: WorkingDayModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/workingday/${id}`, { ...workingday });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/workingday/${id}`);
  }

  findByServiceType( id: string) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/workingday/filter/servicetype/${id}`);
  }
}
