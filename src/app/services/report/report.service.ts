import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  schedule( filter: any) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/report/schedule`, { ...filter });
  }

  expiration() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/report/expiration`);
  }

  history( filter: any) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/report/history`, { ...filter });
  }

  pending() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/report/pending`);
  }

  professional( filter: any) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/report/professional`, { ...filter });
  }

  activity(filter: any ) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/activitylog`, { ...filter });
  }
}
