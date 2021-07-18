import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {jsPDF} from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss']
})
export class ResponseComponent implements OnInit {

  @ViewChild('pdfTable', {static: false}) pdfTable: ElementRef;

  processingDate = '';
  transactionState = '';
  referenceCode = '';
  description =  '';
  transactionId =  '';
  polPaymentMethodType = '';
  cus = '';
  pseBank = '';
  lapPaymentMethod = '';
  extra1 = '';

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
      this.extra1 = params.get('extra1');
    });
  }

  ngOnInit(): void {
  }

  public download() {
    const pdfTable = this.pdfTable.nativeElement;
    html2canvas(pdfTable).then(canvas => {
      let fileWidth = 110;
      let fileHeight = canvas.height * fileWidth / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      PDF.setFontSize(8);
      PDF.text(new Date().toString(), 120, 290);
      let position = 10;
      PDF.addImage(FILEURI, 'PNG', 50, position, fileWidth, fileHeight)
      PDF.save(this.extra1+'.pdf');
    });
    }

}
