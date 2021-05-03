import { Injectable } from '@angular/core';
import { HolidayModel } from 'src/app/models/admin/holiday.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/holiday`);
  }

  post( holiday: HolidayModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/holiday`, { ...holiday });
  }

  put( holiday: HolidayModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/holiday/${id}`, { ...holiday });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/holiday/${id}`);
  }
}
