import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentModel } from 'src/app/models/scheduling/payment.model';
import { ReserveService } from 'src/app/services/scheduling/reserve/reserve.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import {Md5} from "md5-typescript";
import { PaymentService } from 'src/app/services/scheduling/payment/payment.service';
import { ToastOptions } from 'ng2-toasty';

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
  submitted = false;
  form: FormGroup;

  payment: PaymentModel = new PaymentModel();

  constructor(
    private route: ActivatedRoute,
    private reserveService: ReserveService,
    private paymentService: PaymentService,
    private router: Router
    ) {

    }

  ngOnInit(): void {
    this.loadReserve();
  }

  loadInformationPayment() {
    const amount = String(this.reservationPayment.service.price * this.reservationPayment.service.quantity);
    const reference = new Date().getTime() + this.reservationPayment.reference;
    this.payment.merchantId = environment.merchantId;
    this.payment.accountId = environment.accountId;
    this.payment.description = 'Compra de servicios 4Home S.A.S';
    this.payment.referenceCode = reference
    this.payment.amount = amount
    this.payment.tax = '0';
    this.payment.taxReturnBase = '0';
    this.payment.currency = 'COP',
    this.payment.signature = Md5.init(environment.apiKey + '~' + environment.merchantId + '~' + reference + '~' + amount + '~COP');
    this.payment.test = '1';
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
          this.reservationPayment.limit = diffHrs + " horas " + diffMins + " minutos ";
          if(this.reservationPayment.type === 1 ) {
            this.reservationPayment.days = this.reservationPayment.reserve_day;
          }
          if(this.reservationPayment.type === 2 ) {
            this.reservationPayment.days = this.reservationPayment.reserve_day.map( (day: any) => this.days[day.day]);
          }
          this.loadFormPayment();
          this.loadInformationPayment();
        }
      });
    }
  }

  loadFormPayment() {
    this.form = new FormGroup({
      buyerEmail: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
      buyerFullName: new FormControl('', [Validators.required]),
      payerDocument: new FormControl('', [Validators.required]),
      telephone: new FormControl('', [Validators.required, Validators.maxLength(10)])
    });
  }


  onSubmit() {

    this.submitted = true;

    if (!this.form.valid) { return; }

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text:  'Espere...'
    });

    Swal.showLoading();


    // this.router.navigateByUrl

    return false;
    // responseUrl: string;
    // confirmationUrl: string;

    this.paymentService.payment( this.payment ).subscribe( (data: any) => {
      Swal.close();

    }, (err) => {
      Swal.close();
      if (err.error.errors) {
        let mensage = '';
      } else {
        if (err.status === 401) {
          this.router.navigateByUrl('/login');
        }
      }
    })

  }
}
