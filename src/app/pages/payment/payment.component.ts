import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentModel } from 'src/app/models/scheduling/payment.model';
import { ReserveService } from 'src/app/services/scheduling/reserve/reserve.service';
import { environment } from 'src/environments/environment';
import {Md5} from "md5-typescript";
import { PromocodeService } from 'src/app/services/finance/promocode/promocode.service';
import Swal from 'sweetalert2';
import { ToastOptions, ToastyService } from 'ng2-toasty';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaymentComponent implements OnInit {

  emailPattern: any = /^[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})/;
  reserve = this.route.snapshot.paramMap.get('reserve');
  reservationPayment = null;
  days: Array<any> = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  payment: PaymentModel = new PaymentModel();
  urlPayu = environment.payu;
  responseUrl = environment.responseUrl;
  confirmationUrl = environment.confirmationUrl;
  promocode = null;
  infoPromocode = null;
  isValidPromocode = false;
  subtotal = 0;
  discount = 0;
  total = 0;
  canPay = false;

  constructor(
    private route: ActivatedRoute,
    private reserveService: ReserveService,
    private promocodeService: PromocodeService,
    private router: Router,
    private toastyService: ToastyService
    ) {

    }

  ngOnInit(): void {
    this.loadReserve();
  }

  loadInformationPayment() {
    var amount = '0';
    if(this.reservationPayment.type === 1) {
      amount = String(this.reservationPayment.service.price * this.reservationPayment.service.quantity);
    } else {
      if(this.reservationPayment.type === 2) {
        amount = String( (this.reservationPayment.service.price * this.reservationPayment.service.quantity)*4 );
      }
    }
    const reference = new Date().getTime().toString().slice(-5) + this.reservationPayment.reference;
    this.payment.merchantId = environment.merchantId;
    this.payment.accountId = environment.accountId;
    this.payment.description = 'Compra de servicios 4Home S.A.S. Servicio con referencia #'  + this.reservationPayment.reference;
    this.payment.referenceCode = reference
    this.payment.amount = amount;
    this.payment.tax = '0';
    this.payment.taxReturnBase = '0';
    this.payment.currency = 'COP',
    this.payment.signature = Md5.init(environment.apiKey + '~' + environment.merchantId + '~' + reference + '~' + amount + '~COP');
    this.payment.test = '1';
    this.payment.extra1 = this.reservationPayment.reference;
    this.payment.extra2 = this.reservationPayment.id;
    if(this.reservationPayment.type === 1) {
      this.subtotal = this.reservationPayment.service.price * this.reservationPayment.service.quantity;
      this.total = this.reservationPayment.service.price * this.reservationPayment.service.quantity;
    } else {
      if(this.reservationPayment.type === 2) {
        this.subtotal = (this.reservationPayment.service.price * this.reservationPayment.service.quantity)*4;
        this.total = (this.reservationPayment.service.price * this.reservationPayment.service.quantity)*4;
      }
    }
  }

  loadReserve() {
    if(this.reserve) {
      this.reserveService.getByReference(atob(this.reserve)).subscribe( resp => {
        if (resp) {
          this.reservationPayment = resp;
          const comparation_date = new Date(this.reservationPayment.scheduling_date);
          comparation_date.setDate(comparation_date.getDate() + 1);
          const now = new Date();
          const diffInMs =  Date.parse(comparation_date.toString()) - Date.parse(now.toString());
          let diffHrs = Math.floor((diffInMs % 86400000) / 3600000);
          let diffMins = Math.round(((diffInMs % 86400000) % 3600000) / 60000);
          this.canPay = diffHrs > 0 ? true : false;
          this.reservationPayment.limit = diffHrs + " horas " + diffMins + " minutos ";
          if(this.reservationPayment.type === 1 ) {
            this.reservationPayment.days = this.reservationPayment.reserve_day;
          }
          if(this.reservationPayment.type === 2 ) {
            this.reservationPayment.days = this.reservationPayment.reserve_day.map( (day: any) => this.days[day.day]);
          }
          this.loadInformationPayment();
        }
      });
    }
  }

  validatePromocode() {

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text:  'Espere...'
    });

    Swal.showLoading();

    this.promocodeService.check(this.promocode).subscribe( resp => {

      Swal.close();

      if(resp) {
        this.isValidPromocode = true;
        this.infoPromocode = resp;
        this.payment.extra3 = resp.code;
        this.discount = (this.subtotal * this.infoPromocode.reward) / 100;
        this.total = this.subtotal - this.discount;
        this.payment.amount = String(this.total);
        this.payment.signature = Md5.init(environment.apiKey + '~' + environment.merchantId + '~' + this.payment.referenceCode + '~' + String(this.total) + '~COP');

        const toastOptions: ToastOptions = {
          title: 'Felicidades',
          msg: 'El descuento se ha aplicado a tu compra',
          showClose: false,
          timeout: 2000,
          theme: 'bootstrap',
        };

        this.toastyService.success(toastOptions);

      } else {
        const toastOptions: ToastOptions = {
          title: 'Error',
          msg: 'El cupón no es valido',
          showClose: false,
          timeout: 2000,
          theme: 'bootstrap',
        };
        this.toastyService.error(toastOptions);
      }
    }, (err) => {
      Swal.close();
      if (err.status === 401) {
        this.router.navigateByUrl('/login');
      }
    });
  }
}
