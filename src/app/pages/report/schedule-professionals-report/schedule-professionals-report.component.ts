import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

import {labels} from '@lang/labels/es_es';
import {messages} from '@lang/messages/es_es';
import {texts} from '@lang/texts/es_es';
import Swal from 'sweetalert2';
import {LoaderService} from '@src/services/common/loader/loader.service';
import {ProfessionalService} from '@src/services/admin/professional/professional.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbCalendar, NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {CustomDatepickerI18n, I18n} from '@src/services/common/datepicker/datepicker.service';
import {Subject} from 'rxjs';
import {DataTableLanguage} from '@src/models/common/datatable';
import {ToastyService} from 'ng2-toasty';
import {ReportService} from '@src/services/report/report.service';
import {DataTableDirective} from 'angular-datatables';
import {Router} from '@angular/router';

@Component({
  selector: 'app-schedule-professionals-report',
  templateUrl: './schedule-professionals-report.component.html',
  styleUrls: ['./schedule-professionals-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class ScheduleProfessionalsReportComponent implements OnInit, OnDestroy, AfterViewInit {

  dates: any[] = [];
  today = this.calendar.getToday();
  form: FormGroup;

  @ViewChild(DataTableDirective, {static: false})

  dtElement: DataTableDirective;

  reserves: any[] = [];
  professionals: any[] = [];
  professionalsSelected: any[] = [];

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  dropdownProfessionals: {};

  labels = labels;
  messages = messages;
  texts = texts;

  constructor(private loaderService: LoaderService,
              private professionalService: ProfessionalService,
              private dateService: CustomDatepickerI18n,
              private language: DataTableLanguage,
              private toastyService: ToastyService,
              private reportService: ReportService,
              private router: Router,
              private calendar: NgbCalendar) {
    this.dropdownProfessionals = {
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
    this.getProfessionals();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  loadForm() {
    this.form = new FormGroup({
      init: new FormControl(this.today, [Validators.required]),
      end: new FormControl(this.today, [Validators.required]),
    }, {validators: this.dateService.ValidateDates});
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

  getProfessionals() {
    this.loaderService.loading(true);
    this.professionalService.get().subscribe(resp => {
      this.professionals = resp.data.map(data => {
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

  onSubmit() {

    if (!this.form.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: messages.not_valid_form
      });
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
    const professionals = this.professionalsSelected;

    const initD = new Date(startDate.year, startDate.month - 1, startDate.day);
    const endD = new Date(endDate.year, endDate.month - 1, endDate.day);

    while (initD <= endD) {
      console.log(initD);
      this.dates.push(initD.toDateString());
      initD.setDate(initD.getDate() + 1);
    }

    console.log(this.dates);
    console.log(new Date(this.dates[0]));

    /*this.reportService.schedule({init, end, professionals}).subscribe((data: any) => {

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
    });*/
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
      this.loaderService.loading(false);
    });
  }

  isWeekend(date: NgbDateStruct) {
    return this.dateService.isWeekend(date);
  }

  clear() {
    this.form.reset();
    this.professionalsSelected = [];
    if (this.reserves) {
      this.reserves = [];
      this.dtTrigger.next();
    }
  }

}
