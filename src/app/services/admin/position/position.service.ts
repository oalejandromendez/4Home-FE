import { Injectable } from '@angular/core';
import { PositionModel } from 'src/app/models/admin/position.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class PositionService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/position`);
  }

  post( position: PositionModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/position`, { ...position });
  }

  put( position: PositionModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${ this.url}/api/position/${id}`, { ...position });
  }

  delete( id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${ this.url}/api/position/${id}`);
  }
}
