import { Injectable } from '@angular/core';
import { ReserveModel } from 'src/app/models/scheduling/reserve.mode';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  url: string;

  constructor(
    private headers: HeaderService
  ) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/schedule`);
  }

  post( reserve: ReserveModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/schedule`, { ...reserve });
  }

  reschedule( reserve: ReserveModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/reschedule`, { ...reserve });
  }
}
