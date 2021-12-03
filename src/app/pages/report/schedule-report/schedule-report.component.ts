import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbCalendar, NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {DataTableDirective} from 'angular-datatables';
import {ToastOptions, ToastyService} from 'ng2-toasty';
import {Subject, Subscription} from 'rxjs';
import {DataTableLanguage} from 'src/app/models/common/datatable';
import {CustomDatepickerI18n, I18n} from 'src/app/services/common/datepicker/datepicker.service';
import {LoaderService} from 'src/app/services/common/loader/loader.service';
import {ReportService} from 'src/app/services/report/report.service';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import {CustomerService} from '@src/services/scheduling/customer/customer.service';
import {labels} from '@lang/labels/es_es';
import {messages} from '@lang/messages/es_es';
import {texts} from '@lang/texts/es_es';

@Component({
  selector: 'app-schedule-report',
  templateUrl: './schedule-report.component.html',
  styleUrls: ['./schedule-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class ScheduleReportComponent implements OnInit, OnDestroy, AfterViewInit {

  labels = labels;
  messages = messages;
  texts = texts;

  @ViewChild(DataTableDirective, {static: false})

  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

  today = this.calendar.getToday();
  now: Date = new Date();

  form: FormGroup;
  submitted = false;

  reserves: any[] = [];

  customers: any[] = [];
  dropdownCustomers: {};

  customersSelected: any[] = [];

  constructor(
    private I18n: I18n,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private loaderService: LoaderService,
    private language: DataTableLanguage,
    private reportService: ReportService,
    private dateService: CustomDatepickerI18n,
    private router: Router,
    private toastyService: ToastyService,
    private customerService: CustomerService
  ) {
    this.dropdownCustomers = {
      idField: 'id',
      textField: 'label',
      singleSelection: false,
      allowSearchFilter: true,
      closeDropDownOnSelection: false,
      noDataAvailablePlaceholderText: texts.not_data,
      searchPlaceholderText: labels.search,
      selectAllText: texts.select_all,
      unSelectAllText: texts.unselect_all,
    };
  }

  ngOnInit(): void {
    this.loadForm();
    this.loadTable();
    this.getCustomers();
  }

  loadForm() {
    this.form = new FormGroup({
      init: new FormControl(this.today, [Validators.required]),
      end: new FormControl(this.today, [Validators.required]),
    }, {validators: this.dateService.ValidateDates});
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
      pageLength: 15,
      processing: true,
      destroy: true,
      dom: 'Bfrtip',
      scrollY: '350px',
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
      order: [],
      columnDefs: [
        {targets: 0, searchable: false, visible: false, className: 'notexport'},
      ],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

  isWeekend(date: NgbDateStruct) {
    return this.dateService.isWeekend(date);
  }

  onSubmit() {

    this.submitted = true;

    if (!this.form.valid) {
      return;
    }

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere...'
    });

    Swal.showLoading();

    const startDate = this.form.get('init').value;
    const endDate = this.form.get('end').value;

    const init = startDate.year + '-' + startDate.month + '-' + startDate.day;
    const end = endDate.year + '-' + endDate.month + '-' + endDate.day;
    const customers = this.customersSelected;

    this.reserves = [];

    this.reportService.schedule({init, end, customers}).subscribe((data: any) => {

      if (data.monthly.length === 0 && data.sporadic.length === 0) {
        const toastOptions: ToastOptions = {
          title: 'No existen datos',
          msg: 'No existen datos para los filtros seleccionados',
          showClose: false,
          timeout: 2000,
          theme: 'bootstrap',
        };
        this.toastyService.warning(toastOptions);
      } else {
        if (data.monthly.length > 0) {
          data.monthly.map((reserve: any) => {
            let scheduling_date = new Date(reserve.reserve.scheduling_date);
            scheduling_date.setMonth(scheduling_date.getMonth() + 1);
            let end = new Date(endDate.year, endDate.month - 1, endDate.day);
            let limit: Date;
            if (scheduling_date < end) {
              limit = scheduling_date;
            } else {
              limit = end;
            }
            let today = new Date(startDate.year, startDate.month - 1, startDate.day);
            while (today <= limit) {
              let dayOfWeek = today.getDay();
              if (dayOfWeek == 0) {
                dayOfWeek = 6;
              } else {
                dayOfWeek--;
              }
              if (dayOfWeek === reserve.day) {
                this.reserves.push({
                  date: JSON.parse(JSON.stringify(today)),
                  reserve: reserve.reserve
                });
              }
              today.setDate(today.getDate() + 1);
            }
          });
        }
        if (data.sporadic.length > 0) {
          data.sporadic.map((reserve: any) => {
            this.reserves.push({
              date: reserve.date,
              reserve: reserve.reserve
            });
          });
        }
        this.reserves = _.orderBy(this.reserves, ['date'], ['asc']);
      }
      this.rerender();
      Swal.close();
    }, (err) => {
      Swal.close();

      if (err.error.errors) {
        let mensage = '';

        Object.keys(err.error.errors).forEach((data, index) => {
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
    this.customersSelected = [];
    if (this.reserves) {
      this.reserves = [];
      this.dtTrigger.next();
    }
  }

  getCustomers() {
    this.loaderService.loading(true);
    this.customerService.get().subscribe(resp => {
      this.customers = resp.map(data => {
        const label = `${data.identification} - ${data.name} ${data.lastname}`;
        return {id: data.id, label};
      });
      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error'
      });
    });
  }

}
