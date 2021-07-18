import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Subject, Subscription } from 'rxjs';
import { DataTableLanguage } from 'src/app/models/common/datatable';
import { ProfessionalService } from 'src/app/services/admin/professional/professional.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomDatepickerI18n, I18n } from 'src/app/services/common/datepicker/datepicker.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { ReportService } from 'src/app/services/report/report.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-professional-report',
  templateUrl: './professional-report.component.html',
  styleUrls: ['./professional-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class ProfessionalReportComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(DataTableDirective, {static: false})

  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

  today = this.calendar.getToday();
  now: Date = new Date();

  form: FormGroup;
  submitted = false;

  reserves: any[] = [];
  professionals: any[] = [];

  private subscription: Subscription;

  constructor(
    private I18n: I18n,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private loaderService: LoaderService,
    private language: DataTableLanguage,
    private reportService: ReportService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private toastyService: ToastyService,
    private authService: AuthService,
    private professionalService: ProfessionalService
  ) {
    config.maxDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1 , day: this.now.getDate()};
  }

  ngOnInit(): void {
    this.loadForm();
    this.loadTable();
    this.getProfessionals();
  }

  getProfessionals() {
    this.loaderService.loading(true);
    this.professionalService.get().subscribe( (resp: any) => {
      resp.data.map( (professional: any) => {
        this.professionals.push({ value: String(professional.id), label: professional.name + " " + professional.lastname } );
        this.professionals = this.professionals.slice();
      });
      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Ha ocurrido un error'
      });
    });
  }

  loadForm() {
    this.form = new FormGroup({
      init: new FormControl(this.today, [Validators.required]),
      end: new FormControl(this.today, [Validators.required]),
      professional: new FormControl(null, [Validators.required]),
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
      startDate = startDate.year + '-' + (startDate.month < 10 ? '0' + startDate.month : startDate.month ) + '-' +
                                         (startDate.day < 10 ? '0' + startDate.day : startDate.day) ;
      endDate = endDate.year + '-' + (endDate.month < 10 ? '0' + endDate.month : endDate.month)  + '-' +
                                     (endDate.day < 10 ? '0' + endDate.day : endDate.day);

      dateLimit = now.getFullYear() + '-' + ( (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1) ) + '-' +
                                      (now.getDate() + 1  < 10 ? '0' + now.getDate() + 1 : now.getDate() + 1);
    }
    return startDate !== null && endDate!= null ? startDate <= endDate ? startDate >= dateLimit ? { errorStartDate: true } : endDate >= dateLimit ? { errorEndDate: true } : null : { dates: true } : null;
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
    const professional = this.form.get('professional').value ?? null;

    const init = startDate.year + '-' + startDate.month + '-' + startDate.day;
    const end = endDate.year + '-' + endDate.month + '-' + endDate.day;

    this.reserves = new Array();

    this.reportService.professional({init, end, professional}).subscribe( (data: any) => {
      if(data.length > 0) {
        this.reserves = data;
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
      this.rerender();
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
    if (this.reserves) {
      this.reserves = new Array();
      this.dtTrigger.next();
    }
  }
}
