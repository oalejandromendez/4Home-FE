import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbCalendar, NgbDatepickerConfig, NgbDatepickerI18n, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableDirective} from 'angular-datatables';
import {ToastOptions, ToastyConfig, ToastyService} from 'ng2-toasty';
import {Subject} from 'rxjs';
import {DataTableLanguage} from 'src/app/models/common/datatable';
import {UserService} from 'src/app/services/admin/user/user.service';
import {LoaderService} from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';
import {labels} from '@lang/labels/es_es';
import {messages} from '@lang/messages/es_es';
import {texts} from '@lang/texts/es_es';
import {NoveltyModel} from '@src/models/admin/novelty.model';
import {NoveltyService} from '@src/services/admin/novelty/novelty.service';
import {ProfessionalService} from '@src/services/admin/professional/professional.service';
import {CustomDatepickerI18n, I18n} from '@src/services/common/datepicker/datepicker.service';
import {ReportService} from '@src/services/report/report.service';
import * as _ from 'lodash';
import {ServicetypeService} from '@src/services/admin/servicetype/servicetype.service';
import {WorkingdayService} from '@src/services/admin/workingday/workingday.service';
import {ServiceService} from '@src/services/admin/service/service.service';
import {ReserveModel} from '@src/models/scheduling/reserve.mode';

@Component({
  selector: 'app-novelties',
  templateUrl: './novelties.component.html',
  styleUrls: ['./novelties.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class NoveltiesComponent implements OnInit, OnDestroy {

  labels = labels;
  texts = texts;
  messages = messages;
  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('openScheduleModal') openScheduleModal: ElementRef;
  @ViewChild('openReScheduleModal') openReScheduleModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;
  @ViewChild('closeScheduleModal') closeScheduleModal: ElementRef;
  @ViewChild('closeReScheduleModal') closeReScheduleModal: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  dtOptions: any = {};
  novelties: any[];
  reservesDays: any[] = [];
  reserves: any[] = [];
  novelty: NoveltyModel = new NoveltyModel();
  submitted = false;
  submittedReSchedule = false;
  form: FormGroup;
  formReSchedule: FormGroup;
  id: any;
  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;
  quantity = 0;

  professionals: Array<any> = [];
  professionalsReSchedule: Array<any> = [];
  types: Array<any> = [];
  serviceTypes: Array<any> = [];
  workingDays: Array<any> = [];
  services: Array<any> = [];
  service = null;
  listServices: Array<any> = [];

  today = this.calendar.getToday();

  reserve: ReserveModel = new ReserveModel();

  typesPeriodicity: Array<any> = [
    {
      value: 1,
      label: 'Esporádico'
    }
  ];

  get daysArray() {
    return this.formReSchedule.get('days') as FormArray;
  }

  now: Date = new Date();
  minDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1, day: this.now.getDate() + 2};

  constructor(
    private router: Router,
    private toastyService: ToastyService,
    private noveltyService: NoveltyService,
    private loaderService: LoaderService,
    private userService: UserService,
    private language: DataTableLanguage,
    private modalService: NgbModal,
    private toastyConfig: ToastyConfig,
    private professionalService: ProfessionalService,
    private calendar: NgbCalendar,
    public dateService: CustomDatepickerI18n,
    private reportService: ReportService,
    private servicetypeService: ServicetypeService,
    private formBuilder: FormBuilder,
    private serviceService: ServiceService,
    private workingdayService: WorkingdayService
  ) {
    this.loaderService.loading(true);
    this.loadForm();
    this.getPermissions();
    this.toastyConfig.theme = 'material';
    this.types = this.noveltyService.Type;
  }

  ngOnInit(): void {
    this.loadTable();
    this.getProfessionals();
    this.getServiceTypes();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  loadForm() {
    this.form = new FormGroup({
      professional: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      init: new FormControl('', [Validators.required]),
      end: new FormControl('', [Validators.required]),
    }, {validators: this.dateService.ValidateDates});
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  loadData() {
    this.noveltyService.get().subscribe(resp => {
      this.novelties = resp.data;
      this.dtTrigger.next();
      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error'
      });
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
      scrollY: '300px',
      scrollX: 'auto',
      scrollCollapse: true,
      buttons: [
        {
          className: 'btn-sm boton-excel wid-5',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/añadir.png">',
          titleAttr: labels.new_novelty,
          action(e: any) {
            that.cancel();
            that.openModal.nativeElement.click();
          }
        },
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
        },
      ],
      columnDefs: [
        {targets: 0, searchable: false, visible: false, className: 'notexport'},
        {targets: 2, className: 'text-center'},
        {targets: 3, className: 'wid-15 text-center'}
      ],
      order: [],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

  onSubmit() {

    this.submitted = true;

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

    const initDate = this.form.value.init;
    const endDate = this.form.value.end;

    this.novelty = {
      professional: this.form.value.professional,
      type: this.form.value.type,
      status: 0,
      initial_date: `${initDate.year}-${initDate.month}-${initDate.day}`,
      final_date: `${endDate.year}-${endDate.month}-${endDate.day}`,
    };

    if (this.id) {

      this.noveltyService.put(this.novelty, this.id).subscribe(() => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El cargo se ha editado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.cancel();
        this.closeModal.nativeElement.click();
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
            this.router.navigateByUrl('/auth/login');
          }
        }
      });

    } else {

      this.noveltyService.post(this.novelty).subscribe(() => {
        Swal.close();
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El cargo se ha registrado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.form.reset({status: true});
        this.submitted = false;
        this.closeModal.nativeElement.click();
        this.novelty = new NoveltyModel();
        this.rerender();
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
    this.submitted = false;
  }

  onSubmitReSchedule() {

    this.submittedReSchedule = true;
    console.log(this.formReSchedule);

    if (!this.formReSchedule.valid) {
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

    this.reserve = this.formReSchedule.value;
    //this.reserve.user = this.customer.id;

    const listDays = [];

    this.daysArray.value.map((day: any) => {

      if (day.type === 1) {
        const date = day.date;
        listDays.push({
          date: date.year + '-' + date.month + '-' + date.day
        });
      }

    });

    console.log(listDays);

    Swal.close();
  }

  edit(id: any) {
    if (id) {
      this.id = id;
      const data = this.novelties.find((position: any) => position.id === id);
      this.novelty = data;
      if (data) {
        this.form.patchValue(data);
        this.form.controls.professional.setValue(String(data.professional.id));
        if (data.initial_date) {
          const initial_date = data.initial_date.split('-');
          this.form.controls.init.setValue({year: +initial_date[0], month: +initial_date[1], day: +initial_date[2]});
        }
        if (data.final_date) {
          const final_date = data.final_date.split('-');
          this.form.controls.end.setValue({year: +final_date[0], month: +final_date[1], day: +final_date[2]});
        }
        this.form.enable();
        this.openModal.nativeElement.click();
      }
    }
  }

  cancel() {
    this.id = null;
    this.form.reset();
    this.submitted = false;
    this.novelty = new NoveltyModel();
    this.reservesDays = [];
    this.reserves = [];
    if (!this.canCreate) {
      this.form.disable();
    }
  }

  cancelSchedule() {
    this.id = null;
    this.form.reset();
    this.submitted = false;
    this.novelty = new NoveltyModel();
    this.reservesDays = [];
    this.reserves = [];
    if (!this.canCreate) {
      this.form.disable();
    }
  }

  cancelReSchedule() {
    this.id = null;
    this.form.reset();
    this.formReSchedule.reset();
    this.submitted = false;
    this.novelty = new NoveltyModel();
    if (!this.canCreate) {
      this.form.disable();
      this.formReSchedule.disable();
    }
  }

  delete(id: any, index: any) {
    if (id) {
      Swal.fire({
        title: 'Esta seguro?',
        text: 'Usted no podra recuperar los datos eliminados',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: false,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Confirmar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return new Promise<void>((resolve) => {
            this.noveltyService.delete(id).subscribe(data => {
              this.novelties.splice(index, 1);
              this.dtOptions = {};
              this.loadTable();
              this.rerender();
              this.cancel();
              Swal.fire('Proceso Exitoso!', 'Se ha eliminado el cargo exitosamente', 'success');
            }, (err: any) => {
              Swal.fire('Error', err.error.message, 'error');
            });
            setTimeout(() => {
              resolve();
            }, 5000);
          });
        }
      });
    }
  }

  open(modal: any) {
    this.modalService.open(modal);
  }

  openModalSchedule(modal: any) {
    this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-schedule'
    });
  }

  openModalReschedule(modal: any) {
    this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-reschedule'
    });
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  getSchedule(novelty: any) {

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere...'
    });

    Swal.showLoading();

    const init = novelty.initial_date;
    const end = novelty.final_date;
    const professionals = [{id: novelty.professional.id}];

    const status = 4;

    this.reservesDays = [];

    this.reportService.schedule({init, end, status, professionals}).subscribe((data: any) => {

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
            let original_scheduling_date = new Date(reserve.reserve.scheduling_date);
            scheduling_date.setMonth(scheduling_date.getMonth() + 1);
            const endDate = new Date(end);
            const startDate = new Date(init);

            let limit: Date;
            let initDate: Date;

            if (scheduling_date < endDate) {
              limit = scheduling_date;
            } else {
              limit = endDate;
            }
            if (startDate > original_scheduling_date) {
              initDate = startDate;
            } else {
              initDate = original_scheduling_date;
            }
            limit.setDate(limit.getDate() + 1);
            while (initDate <= limit) {
              let dayOfWeek = initDate.getDay();
              if (dayOfWeek == 0) {
                dayOfWeek = 6;
              } else {
                dayOfWeek--;
              }
              if (dayOfWeek === reserve.day) {
                this.reservesDays.push({
                  date: JSON.parse(JSON.stringify(initDate)),
                  reserve: reserve.reserve
                });
              }
              initDate.setDate(initDate.getDate() + 1);
            }
          });
        }
        if (data.sporadic.length > 0) {
          data.sporadic.map((reserve: any) => {
            this.reservesDays.push({
              date: reserve.date,
              reserve: reserve.reserve
            });
          });
        }
        const reservesDays = _.orderBy(this.reservesDays, ['date'], ['asc']);
        this.orderPerReserves(reservesDays);

      }
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

  orderPerReserves(reservesDays) {

    reservesDays.forEach((reserveday: any) => {
      const auxReserveday = reserveday;
      let reserveIndex = this.reserves.findIndex(data => data.reference === auxReserveday.reserve.reference);
      if (reserveIndex !== -1) {
        delete auxReserveday.reserve;
        this.reserves[reserveIndex].reserve_days.push(auxReserveday);
      } else {
        this.reserves.push(auxReserveday.reserve);
        reserveIndex = this.reserves.findIndex(data => data.reference === auxReserveday.reserve.reference);
        if (reserveIndex !== -1) {
          this.reserves[reserveIndex].reserve_days = [];
          delete auxReserveday.reserve;
          this.reserves[reserveIndex].reserve_days.push(auxReserveday);
        }
      }
    });
  }

  getPermissions() {
    const that = this;
    this.userService.permissions().subscribe(resp => {
      const create = resp.filter((permission: any) => permission.name === 'CREAR_NOVEDADES');
      if (create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter((permission: any) => permission.name === 'VER_NOVEDADES');
      if (see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter((permission: any) => permission.name === 'MODIFICAR_NOVEDADES');
      if (edit.length >= 1) {
        that.canEdit = true;
      }
      const deleteP = resp.filter((permission: any) => permission.name === 'ELIMINAR_NOVEDADES');
      if (deleteP.length >= 1) {
        that.canDelete = true;
      }
      if (!that.canCreate) {
        this.form.disable();
      }
      this.loadData();
    }, error => {
      const toastOptions: ToastOptions = {
        title: 'Error',
        msg: 'El ususario no tiene roles',
        showClose: false,
        timeout: 2000,
        theme: 'bootstrap',
      };
      this.toastyService.error(toastOptions);
      this.loaderService.loading(true);
    });
  }

  getProfessionals() {
    this.loaderService.loading(true);
    this.professionalService.get().subscribe((resp: any) => {
      resp.data.map((type: any) => {
        this.professionals.push({value: String(type.id), label: `${type.identification} - ${type.name} ${type.lastname}`});
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

  preschedule(novelty: any) {
    this.getSchedule(novelty);
    this.openScheduleModal.nativeElement.click();
  }

  re_Schedule(reserve: any) {
    console.log(reserve);
    this.loadReScheduleForm();
    this.loadDates(reserve.reserve_days.length);
    this.openReScheduleModal.nativeElement.click();
  }

  loadReScheduleForm() {
    this.formReSchedule = new FormGroup({
      professional: new FormControl('', [Validators.required]),
      service_type: new FormControl('', [Validators.required]),
      working_day: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      service: new FormControl('', [Validators.required]),
      days: this.formBuilder.array([], {validators: this.minDaySelected})
    });

    this.formReSchedule.controls.professional.disable();

    this.formReSchedule.get('service_type').valueChanges.subscribe(resp => {
      this.workingDays = [];
      this.services = [];
      this.formReSchedule.controls.working_day.reset();
      this.formReSchedule.controls.type.reset();
      this.formReSchedule.controls.service.reset();
      this.formReSchedule.controls.professional.reset();
      this.formReSchedule.controls.professional.disable();
      this.service = null;
      this.getWorkingDays(resp);
    });

    this.formReSchedule.get('working_day').valueChanges.subscribe(() => {
      this.services = [];
      this.formReSchedule.controls.type.reset();
      this.formReSchedule.controls.service.reset();
      this.formReSchedule.controls.professional.reset();
      this.formReSchedule.controls.professional.disable();
      this.service = null;
    });

    this.formReSchedule.get('type').valueChanges.subscribe(() => {
      this.services = [];
      this.formReSchedule.controls.service.reset();
      this.formReSchedule.controls.professional.reset();
      this.formReSchedule.controls.professional.disable();
      this.service = null;
      this.getServices();
    });
  }

  getServiceTypes() {
    this.loaderService.loading(true);
    this.servicetypeService.get().subscribe((resp: any) => {
      resp.data.filter((serviceType: any) => serviceType.status === 1).map((serviceType: any) => {
        this.serviceTypes.push({value: serviceType.id, label: serviceType.name});
        this.serviceTypes = this.serviceTypes.slice();
      });
      this.loaderService.loading(false);
    }, () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error'
      });
    });
  }

  getWorkingDays(serviceType: string) {
    if (serviceType) {
      this.loaderService.loading(true);
      this.workingdayService.findByServiceType(serviceType).subscribe(resp => {
        resp.data.filter((workingDay: any) => workingDay.status === 1).map((workingDay: any) => {
          this.workingDays.push({value: workingDay.id, label: workingDay.name});
          this.workingDays = this.workingDays.slice();
        });
        this.loaderService.loading(false);
      }, error => {
        this.loaderService.loading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error'
        });
      });
    }
  }

  getServices() {
    const type = this.formReSchedule.controls.type.value;
    const workingDay = this.formReSchedule.controls.working_day.value;
    if (type && workingDay) {
      this.loaderService.loading(true);
      this.serviceService.findByTypeAndWorking(type, workingDay).subscribe(resp => {
        this.listServices = resp.data;
        resp.data.filter((service: any) => service.status === 1 && service.is_novelty === 1).map((service: any) => {
          this.services.push({value: service.id, label: service.name});
          this.services = this.services.slice();
        });
        this.loaderService.loading(false);
      }, error => {
        this.loaderService.loading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error'
        });
      });
    }
  }

  loadDates(dates) {
    this.quantity = dates;
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0);
    }
    for (let i = 0; i < dates; i++) {
      this.daysArray.push(
        this.formBuilder.group({
          index: new FormControl(this.daysArray.controls.length),
          date: new FormControl(null, [Validators.required, this.validateDate.bind(this)]),
          type: 1
        })
      );
    }
  }

  validateDate(control: AbstractControl) {
    let exist = false;
    if (this.daysArray.length > 0 && !this.formReSchedule.pristine) {
      this.daysArray.controls.map(o => {
        if (o.value.date != null) {
          if (o.value.date.year === control.value.year &&
            o.value.date.month === control.value.month &&
            o.value.date.day === control.value.day
          ) {
            exist = true;
          }
        }
      });
    }
    return exist ? {repeatedDate: true} : null;
  }

  minDaySelected: ValidatorFn = (form: FormArray) => {
    const days = form.controls.map(control => control.value.type === 2);
    const selected = form.controls.map(control => control.value.selected).reduce((prev, next) => next ? prev + next : prev, 0);
    return days.length === 7 ? selected !== this.quantity ? {invalidQuantity: true} : null : null;
  };

  changeDate() {
    let ableProfessional = false;
    this.daysArray.value.map((day: any) => {
      if (day.date) {
        ableProfessional = true;
      } else {
        ableProfessional = false;
      }
    });

    if (ableProfessional && this.formReSchedule.controls.service.value) {
      this.formReSchedule.controls.professional.enable();
    }
  }

  checkAvailability() {




  }

}

