import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { ToastyService } from 'ng2-toasty';
import { Subject, Subscription } from 'rxjs';
import { DataTableLanguage } from 'src/app/models/common/datatable';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { ReportService } from 'src/app/services/report/report.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pending-report',
  templateUrl: './pending-report.component.html',
  styleUrls: ['./pending-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PendingReportComponent implements OnInit {

  @ViewChild(DataTableDirective, {static: false})

  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

  reserves: any[] = [];

  private subscription: Subscription;

  constructor(
    private loaderService: LoaderService,
    private language: DataTableLanguage,
    private reportService: ReportService,
    private router: Router,
    private toastyService: ToastyService
  ) { }

  ngOnInit(): void {
    this.loadTable();
    this.loadData();
  }

  loadData() {
    this.reportService.pending().subscribe(resp => {
      this.reserves = resp;
      this.dtTrigger.next();
      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Ha ocurrido un error'
      });
    });
  }

  loadTable() {
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
      processing: true,
      destroy: true,
      dom: 'Bfrtip',
      scrollY: '350px',
      scrollX: 'auto',
      scrollCollapse: true,
      buttons: [
        {
          className: 'btn-sm boton-excel wid-5',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/excel.png">',
          titleAttr: 'Exportar como Excel',
          extend: 'excel',
          extension: '.xls',
          exportOptions: {
            columns: ':not(.notexport)'
          }
        },
        {
          className: 'btn-sm boton-copiar wid-5',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/copiar.png">',
          titleAttr: 'Copiar',
          extend: 'copy',
          extension: '.copy',
          exportOptions: {
            columns: ':not(.notexport)'
          }
        },
        {
            className: 'btn-sm boton-imprimir wid-5',
            text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/print.png">',
            titleAttr: 'Imprimir',
            extend: 'print',
            extension: '.print',
            exportOptions: {
              columns: ':not(.notexport)'
          }
        }
      ],
      order: [],
      columnDefs: [
        { targets: 0, searchable: false, visible: false, className: 'notexport' },
      ],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

}
