import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  url: string;

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  admin() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/dashboard/admin`);
  }

  customer(id: any) {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/dashboard/customer/${id}`);
  }

}
