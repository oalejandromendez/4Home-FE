import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Subject, Subscription } from 'rxjs';
import { DataTableLanguage } from 'src/app/models/common/datatable';
import { HistoryModel } from 'src/app/models/scheduling/history.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomDatepickerI18n, I18n } from 'src/app/services/common/datepicker/datepicker.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { HistoryService } from 'src/app/services/scheduling/history/history.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class HistoryComponent implements OnInit, OnDestroy, AfterViewInit  {

  @ViewChild(DataTableDirective, {static: false})

  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

  today = this.calendar.getToday();
  now: Date = new Date();

  form: FormGroup;
  submitted = false;

  audits: any[];

  history: HistoryModel = new HistoryModel();

  private subscription: Subscription;

  constructor(
    private I18n: I18n,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private loaderService: LoaderService,
    private language: DataTableLanguage,
    private historyService: HistoryService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private toastyService: ToastyService,
    private authService: AuthService
  ) {
    config.minDate = {year: 2000, month: 1, day: 1};
    config.maxDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1 , day: this.now.getDate()};
  }

  ngOnInit(): void {
    this.loadForm();
    this.loadTable();
  }

  loadForm() {
    this.form = new FormGroup({
      init: new FormControl(this.today, [Validators.required]),
      end: new FormControl(this.today, [Validators.required]),
    }, {validators: this.ValidateDates});
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
      this.loaderService.loading(false);
    });
  }

  loadTable() {
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 8,
      processing: true,
      destroy: true,
      dom: 'Bfrtip',
      scrollY: '220px',
      scrollX: 'auto',
      scrollCollapse: true,
      buttons: [
        {
          className: 'btn-sm boton-excel wid-7',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/excel.png">',
          titleAttr: 'Exportar como Excel',
          extend: 'excel',
          extension: '.xls',
          exportOptions: {
            columns: ':not(.notexport)'
          }
        },
        {
          className: 'btn-sm boton-copiar wid-7',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/copiar.png">',
          titleAttr: 'Copiar',
          extend: 'copy',
          extension: '.copy',
          exportOptions: {
            columns: ':not(.notexport)'
          }
        },
        {
            className: 'btn-sm boton-imprimir wid-7',
            text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/print.png">',
            titleAttr: 'Imprimir',
            extend: 'print',
            extension: '.print',
            exportOptions: {
              columns: ':not(.notexport)'
          }
        }
      ],
      columnDefs: [
        { targets: 0, searchable: false, visible: false, className: 'notexport' },
      ],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  ValidateDates: ValidatorFn = (formG: FormGroup) => {
    let startDate = formG.get('init').value;
    let endDate = formG.get('end').value;
    const now  = new Date();
    let dateLimit: string;

    if (startDate && endDate) {
      startDate = startDate.year + '-' + (startDate.month < 10 ? '0' + startDate.month : startDate.month ) + '-' + (startDate.day < 10 ? '0' + startDate.day : startDate.day) ;
      endDate = endDate.year + '-' + (endDate.month < 10 ? '0' + endDate.month : endDate.month)  + '-' + (endDate.day < 10 ? '0' + endDate.day : endDate.day);
      dateLimit = now.getFullYear() + '-' + ( (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1) ) + '-' + (now.getDate() + 1  < 10 ? '0' + now.getDate() + 1 : now.getDate() + 1);
    }
    return startDate !== null && endDate !== null  && startDate <= endDate ? startDate >= dateLimit ? { errorStartDate: true } : endDate >= dateLimit ? { errorEndDate: true } : null : { dates: true };
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

    const startDate = this.form.get('init').value;
    const endDate = this.form.get('end').value;

    this.history.init = startDate.year + '-' + startDate.month + '-' + startDate.day;
    this.history.end = endDate.year + '-' + endDate.month + '-' + endDate.day;
    const auth = this.authService.authUser();
    this.history.user = auth.id;

    this.historyService.post(this.history).subscribe( (data: any) => {

      if(data.length > 0) {
        this.audits = data;
        this.rerender();
      } else {
        const toastOptions: ToastOptions = {
          title: 'No existen datos',
          msg: 'No existen datos para los filtros seleccionados',
          showClose: false,
          timeout: 2000,
          theme: 'bootstrap',
        };
        this.toastyService.warning(toastOptions);
      }

      Swal.close();

    }, (err) => {
      Swal.close();

      if (err.error.errors) {
        let mensage = '';

        Object.keys(err.error.errors).forEach( (data, index) => {
          mensage += err.error.errors[data][0] + '<br>';
        });

        const toastOptions: ToastOptions = {
          title: 'Error',
          msg: mensage,
          showClose: false,
          timeout: 2000,
          theme: 'bootstrap',
        };
        this.toastyService.error(toastOptions);
      } else {
        if (err.status === 401) {
          this.router.navigateByUrl('/login');
        }
      }
    });
  }

  clear() {
    this.form.reset();
    this.changeDetectorRef.detectChanges();
    if (this.audits) {
      this.audits = new Array();
      this.dtTrigger.next();
    }
  }
}
