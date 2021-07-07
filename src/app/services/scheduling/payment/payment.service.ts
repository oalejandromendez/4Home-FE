import { Injectable } from '@angular/core';
import { PaymentModel } from 'src/app/models/scheduling/payment.model';
import { environment } from 'src/environments/environment';
import { HeaderService } from '../../common/header/header.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  url: string;
  url_payu: string;

  constructor(
    private headers: HeaderService
  ) {
    this.url = environment.host;
    this.url_payu = environment.payu;
  }

  post( payment: PaymentModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/payment`, { ...payment });
  }

  banksList() {
    return this.headers.get(sessionStorage.getItem('token'), `${ this.url}/api/payment/filter/banks`);
  }

  payment( payment: PaymentModel ) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url_payu }`, { ...payment });
  }
}
