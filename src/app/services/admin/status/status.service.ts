import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';
import { StatusModel } from 'src/app/models/admin/status.model';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/status`);
  }

  post( status: StatusModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/status`, { ...status });
  }

  put( status: StatusModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/status/${id}`, { ...status });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/status/${id}`);
  }

}
