import {Injectable} from '@angular/core';
import {ReserveModel} from 'src/app/models/scheduling/reserve.mode';
import {environment} from 'src/environments/environment';
import {HeaderService} from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class ReserveService {

  url: string;

  constructor(
    private headers: HeaderService
  ) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${this.url}/api/reserve`);
  }

  getByCustomer(idCustomer: any) {
    return this.headers.get(sessionStorage.getItem('token'), `${this.url}/api/reserve/filter/customer/${idCustomer}`);
  }

  getByStatus(status: number) {
    return this.headers.get(sessionStorage.getItem('token'), `${this.url}/api/reserve/filter/status/${status}`);
  }

  getScheduleByCustomer(idCustomer: any) {
    return this.headers.get(sessionStorage.getItem('token'), `${this.url}/api/reserve/filter/schedule/customer/${idCustomer}`);
  }

  getByReference(reference: any) {
    return this.headers.get(sessionStorage.getItem('token'), `${this.url}/api/reserve/filter/reference/${reference}`);
  }

  post(reserve: ReserveModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${this.url}/api/reserve`, {...reserve});
  }

  put(reserve: ReserveModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${this.url}/api/reserve/${id}`, {...reserve});
  }

  delete(id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${this.url}/api/reserve/${id}`);
  }

  validateDateInRange(initialServiceDate: any, lastServiceDate: Date, serviceDays, dateToValidate: Date) {

    const initialServiceDateSplit = initialServiceDate.split('-');
    const initialdate = new Date(initialServiceDateSplit[0], initialServiceDateSplit[1] - 1, initialServiceDateSplit[2]);

    while (initialdate <= lastServiceDate) {
      if (initialdate.getTime() === dateToValidate.getTime()) {
        const dayI = initialdate.getDay();
        return serviceDays.find((d: any) => d.day === dayI);
      } else {
        initialdate.setDate(initialdate.getDate() + 1);
      }
    }
    return false;
  }

  getFirstAndLastServiceDate(initialServiceDate, lastServiceDate, serviceDays) {
    let firstAvailableDay: Date = null;
    let lastAvailableDay: Date = null;
    while (initialServiceDate <= lastServiceDate) {
      const dayI = initialServiceDate.getDay();
      const dayE = lastServiceDate.getDay();
      const existsI = serviceDays.find((d: any) => d.day === dayI || d.index === dayI);
      const existsE = serviceDays.find((d: any) => d.day === dayE || d.index === dayE);
      if (!firstAvailableDay) {
        if (existsI) {
          firstAvailableDay = initialServiceDate;
        } else {
          initialServiceDate.setDate(initialServiceDate.getDate() + 1);
        }
      }

      if (!lastAvailableDay) {
        if (existsE) {
          lastAvailableDay = lastServiceDate;
        } else {
          lastServiceDate.setDate(lastServiceDate.getDate() - 1);
        }
      }
      if (firstAvailableDay && lastAvailableDay) {
        break;
      }
    }
    return {firstAvailableDay, lastAvailableDay};
  }

}
