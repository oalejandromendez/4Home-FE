import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss']
})
export class ResponseComponent implements OnInit {

  processingDate = '';
  transactionState = '';
  referenceCode = '';
  description =  '';
  transactionId =  '';
  polPaymentMethodType = '';
  cus = '';
  pseBank = '';
  lapPaymentMethod = '';

  constructor(
    private activatedRoute: ActivatedRoute
  )
  {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.processingDate = params.get('processingDate');
      this.transactionState = params.get('transactionState');
      this.referenceCode = params.get('referenceCode');
      this.description = params.get('description');
      this.transactionId = params.get('transactionId');
      this.polPaymentMethodType = params.get('polPaymentMethodType');
      this.cus = params.get('cus');
      this.pseBank = params.get('pseBank');
      this.lapPaymentMethod = params.get('lapPaymentMethod');
    });
  }

  ngOnInit(): void {
  }

}
