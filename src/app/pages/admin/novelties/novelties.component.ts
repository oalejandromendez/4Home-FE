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
import {NoveltyModel, ReserveAffected} from '@src/models/admin/novelty.model';
import {NoveltyService} from '@src/services/admin/novelty/novelty.service';
import {ProfessionalService} from '@src/services/admin/professional/professional.service';
import {CustomDatepickerI18n, I18n} from '@src/services/common/datepicker/datepicker.service';
import {ReportService} from '@src/services/report/report.service';
import * as _ from 'lodash';
import {ServicetypeService} from '@src/services/admin/servicetype/servicetype.service';
import {WorkingdayService} from '@src/services/admin/workingday/workingday.service';
import {ServiceService} from '@src/services/admin/service/service.service';
import {ReserveModel} from '@src/models/scheduling/reserve.mode';
import {ReserveService} from '@src/services/scheduling/reserve/reserve.service';
import {ScheduleService} from '@src/services/scheduling/schedule/schedule.service';
import {CalendarOptions} from '@fullcalendar/common';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import {DatePipe} from '@angular/common';

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
  @ViewChild('openCalendarModal') openCalendarModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;
  @ViewChild('closeScheduleModal') closeScheduleModal: ElementRef;
  @ViewChild('closeReScheduleModal') closeReScheduleModal: ElementRef;
  @ViewChild('closeModalCalendar') closeModalCalendar: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  dtOptions: any = {};
  novelties: any[];
  reservesDays: any[] = [];
  reservesAffected: Array<ReserveAffected> = [];
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
  supervisors: Array<any> = [];
  professionalsReSchedule: Array<any> = [];
  types: Array<any> = [];
  serviceTypes: Array<any> = [];
  workingDays: Array<any> = [];
  workingDay: any;
  services: Array<any> = [];
  service = null;
  listServices: Array<any> = [];

  today = this.calendar.getToday();

  reserve: ReserveModel = new ReserveModel();

  validateAvailability = false;
  searchProfessional = '';
  professional = null;
  calendarOptions: CalendarOptions = {};
  reservation = null;
  idSelectedReserve: number;

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
  minDateNovelty = {year: this.now.getFullYear(), month: this.now.getMonth() + 1, day: this.now.getDate()};
  minDateReschedule = {year: this.now.getFullYear(), month: this.now.getMonth() + 1, day: this.now.getDate() + 1};

  constructor(
    private router: Router,
    private toastyService: ToastyService,
    public noveltyService: NoveltyService,
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
    private workingdayService: WorkingdayService,
    private reserveService: ReserveService,
    public scheduleService: ScheduleService,
    private datepipe: DatePipe,
  ) {
    this.loaderService.loading(true);
    this.loadForm();
    this.loadReScheduleForm();
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

  rerender() {
    return new Promise<any>(resolve => {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.loadData().then(r => {
          if (r.status) {
            this.novelties = r.data;
            resolve();
          }
        });
      });
    });
  }

  loadData() {
    return new Promise<any>(resolve => {
      this.noveltyService.get().subscribe(resp => {
        resp.data.sort((x, y) => +new Date(y.created_at) - +new Date(x.created_at));
        this.dtTrigger.next();
        this.loaderService.loading(false);
        resolve({status: true, data: resp.data});
      }, () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error'
        });
        resolve({status: false, data: null});
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
      final_date: `${endDate.year}-${endDate.month}-${endDate.day}`
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
        this.rerender().then(() => {
          Swal.close();
        });

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
        this.rerender().then();
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

    if (!this.formReSchedule.controls.professional.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: texts.professional_not_available
      });
      return;
    }

    if (!this.formReSchedule.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: messages.not_valid_form
      });
      return;
    }

    this.reserve = {...this.reserve, ...this.formReSchedule.value};

    const listDays = [];

    this.daysArray.value.map((day: any) => {

      if (day.type === this.scheduleService.SPORADIC_PERIODICITY) {
        const date = day.date;
        listDays.push({
          date: date.year + '-' + date.month + '-' + date.day
        });
      }

    });
    this.reserve.days = listDays;

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere...'
    });

    Swal.showLoading();

    this.noveltyService.reschedule(this.reserve).subscribe(() => {
      let idReserves: string;
      let idReservesArray = [];
      if (this.novelty.ids_reserves) {
        idReservesArray = this.novelty.ids_reserves.split(',');
        idReservesArray.push(this.idSelectedReserve.toString());
        idReserves = idReservesArray.join(',');
      } else {
        idReserves = this.idSelectedReserve.toString();
      }

      let callPreschedule = true;
      let status = this.noveltyService.STATUS_EN_PROCESO.value;
      if (idReservesArray.length === this.reservesAffected.length) {
        status = this.noveltyService.STATUS_AGENDADA.value;
        callPreschedule = false;
      }

      const novelty: NoveltyModel = {
        professional: this.novelty.professional.id,
        status,
        type: this.novelty.type,
        ids_reserves: idReserves,
      };

      this.updateNovelty(novelty, callPreschedule);


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
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: messages.service_error
          });
        }
      }
    });
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

  updateNovelty(novelty, callPreschedule) {
    this.noveltyService.put(novelty, this.novelty.id.toString()).subscribe(() => {
      Swal.close();

      const toastOptions: ToastOptions = {
        title: '¡Proceso Exitoso!',
        msg: 'Se ha re agendado la reserva exitosamente',
        showClose: false,
        timeout: 3000,
        theme: 'bootstrap',
      };
      this.toastyService.success(toastOptions);
      this.rerender().then(() => {
        this.closeModalCalendar.nativeElement.click();
        this.closeReScheduleModal.nativeElement.click();
        this.reservesAffected = [];
        this.form.reset();
        this.formReSchedule.controls.service.reset();
        this.formReSchedule.controls.service_type.reset();
        this.formReSchedule.controls.working_day.reset();
        this.formReSchedule.controls.type.reset();
        this.formReSchedule.controls.supervisor.reset();
        this.formReSchedule.controls.professional.reset();
        this.submitted = false;
        this.submittedReSchedule = false;
        this.validateAvailability = false;
        this.novelty = this.novelties.filter(data => data.id === this.novelty.id)[0];
        if (callPreschedule) {
          this.getSchedule(this.novelty).then(() => {
            this.openScheduleModal.nativeElement.click();
          });
        }
      });

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
  }

  cancel() {
    this.id = null;
    this.form.reset();
    this.submitted = false;
    this.novelty = new NoveltyModel();
    this.reservesDays = [];
    this.reservesAffected = [];
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
    this.reservesAffected = [];
    if (!this.canCreate) {
      this.form.disable();
    }
  }

  cancelReSchedule() {
    this.id = null;
    this.form.reset();
    this.formReSchedule.controls.service.reset();
    this.formReSchedule.controls.service_type.reset();
    this.formReSchedule.controls.working_day.reset();
    this.formReSchedule.controls.type.reset();
    this.formReSchedule.controls.supervisor.reset();
    this.formReSchedule.controls.professional.reset();
    this.submitted = false;
    this.submittedReSchedule = false;
    this.novelty = new NoveltyModel();
    this.validateAvailability = false;
    if (!this.canCreate) {
      this.form.disable();
      this.formReSchedule.disable();
    }
    this.openScheduleModal.nativeElement.click();
  }

  cancelCalendar() {
    this.submitted = false;
    this.formReSchedule.controls.supervisor.reset();
    this.formReSchedule.controls.professional.reset();
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
              this.rerender().then(() => {
                this.cancel();
                Swal.fire('Proceso Exitoso!', 'Se ha eliminado el cargo exitosamente', 'success');
              });
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

  openModalCalendar(modal: any) {
    this.modalService.open(modal, {
      backdrop: 'static',
      backdropClass: 'modal-calendar-backdrop',
      windowClass: 'modal-reschedule'
    });
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  getSchedule(novelty: any) {
    return new Promise<any>(resolve => {
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

      this.noveltyService.schedule({init, end, status, professionals}).subscribe((data: any) => {

        if (data.monthly.length === 0 && data.sporadic.length === 0) {

          const noveltyUpdate: NoveltyModel = {
            professional: this.novelty.professional.id,
            status: this.noveltyService.STATUS_AGENDADA.value,
            type: this.novelty.type,
          };

          this.updateNovelty(noveltyUpdate, false);
          const toastOptions: ToastOptions = {
            title: 'No existen datos',
            msg: texts.no_reserves_affected,
            showClose: false,
            timeout: 2000,
            theme: 'bootstrap',
          };
          this.toastyService.warning(toastOptions);
          resolve();
        } else {

          if (data.monthly.length > 0) {
            data.monthly.map((reserve: any) => {
              const initialServiceDateSplit = reserve.initial_service_date.split('-');
              const initialServiceDate = new Date(initialServiceDateSplit[0], initialServiceDateSplit[1] - 1, initialServiceDateSplit[2]);
              const latsServiceDate = new Date(initialServiceDate.getFullYear(),
                initialServiceDate.getMonth() + 1, initialServiceDate.getDate());

              const firstAndLastServiceDate = this.reserveService.getFirstAndLastServiceDate(initialServiceDate,
                latsServiceDate, reserve.reserve_day);
              const firstAvailableDay = firstAndLastServiceDate.firstAvailableDay;
              const firstAvailableDayString = this.datepipe.transform(firstAvailableDay, 'yyyy-MM-dd');
              const lastAvailableDay = firstAndLastServiceDate.lastAvailableDay;

              const initDateSplit = init.split('-');
              const endDateSplit = end.split('-');
              const startDate = new Date(initDateSplit[0], initDateSplit[1] - 1, initDateSplit[2]);
              const endDate = new Date(endDateSplit[0], endDateSplit[1] - 1, endDateSplit[2]);

              const reserveAffected = new ReserveAffected();
              reserveAffected.reserve = reserve;
              reserveAffected.status = 0;

              while (startDate <= endDate) {
                if (this.reserveService.validateDateInRange(firstAvailableDayString, lastAvailableDay, reserve.reserve_day, startDate)) {
                  reserveAffected.daysReschedule.push({
                    date: JSON.parse(JSON.stringify(startDate))
                  });
                }
                startDate.setDate(startDate.getDate() + 1);
              }
              if (reserveAffected.daysReschedule.length > 0) {
                reserveAffected.scheduled = false;
                if (novelty.ids_reserves) {
                  const reservesIds = novelty.ids_reserves.split(',');

                  reserveAffected.scheduled = !!reservesIds.some(dataIds => dataIds === reserveAffected.reserve.id.toString());
                }
                this.reservesAffected.push(reserveAffected);
              }
            });
          }
          if (data.sporadic.length > 0) {
            const initDateSplit = init.split('-');
            const endDateSplit = end.split('-');
            const startDate = new Date(initDateSplit[0], initDateSplit[1] - 1, initDateSplit[2]);
            const endDate = new Date(endDateSplit[0], endDateSplit[1] - 1, endDateSplit[2]);
            data.sporadic.map((reserve: any) => {
              const reserveAffected = new ReserveAffected();
              reserveAffected.reserve = reserve;
              reserveAffected.status = 0;
              while (startDate <= endDate) {
                reserve.reserve_day.forEach((day: any) => {

                  const splitReserveDate = day.date.split('-');
                  const reserveDate = new Date(splitReserveDate[0], splitReserveDate[1] - 1, splitReserveDate[2]);

                  if (startDate.getTime() === reserveDate.getTime()) {
                    reserveAffected.daysReschedule.push({
                      date: JSON.parse(JSON.stringify(startDate))
                    });
                  }
                });
                startDate.setDate(startDate.getDate() + 1);
              }
              if (reserveAffected.daysReschedule.length > 0) {
                reserveAffected.scheduled = false;
                if (novelty.ids_reserves) {
                  const reservesIds = novelty.ids_reserves.split(',');

                  reserveAffected.scheduled = !!reservesIds.some(dataIds => dataIds === reserveAffected.reserve.id.toString());
                }
                this.reservesAffected.push(reserveAffected);
              }
            });
          }
        }
        Swal.close();
        resolve();
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
        resolve();
      });
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
      this.loadData().then(r => {
        if (r.status) {
          this.novelties = r.data;
        }
      });
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
        this.professionals.push({value: type.id.toString(), label: `${type.identification} - ${type.name} ${type.lastname}`});
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

  preschedule(novelty: any) {
    this.novelty = novelty;
    this.getSchedule(novelty).then(() => {
      this.openScheduleModal.nativeElement.click();
    });

  }

  re_Schedule(reserve: any) {
    this.loadDates(reserve.daysReschedule.length);
    this.reserve.user = reserve.reserve.user.id;
    this.reserve.customer_address = reserve.reserve.customer_address.id;
    this.idSelectedReserve = reserve.reserve.id;
    this.closeScheduleModal.nativeElement.click();
    this.openReScheduleModal.nativeElement.click();
  }

  loadReScheduleForm() {
    this.formReSchedule = new FormGroup({
      professional: new FormControl('', [Validators.required]),
      service_type: new FormControl('', [Validators.required]),
      working_day: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      service: new FormControl('', [Validators.required]),
      days: this.formBuilder.array([], {validators: this.minDaySelected}),
      supervisor: new FormControl(null, [Validators.required]),
    });

    this.formReSchedule.get('service_type').valueChanges.subscribe(resp => {
      this.workingDays = [];
      this.services = [];
      this.formReSchedule.controls.working_day.reset();
      this.formReSchedule.controls.type.reset();
      this.formReSchedule.controls.service.reset();
      this.formReSchedule.controls.professional.reset();
      this.formReSchedule.controls.supervisor.reset();
      this.service = null;
      this.getWorkingDays(resp);
    });

    this.formReSchedule.get('working_day').valueChanges.subscribe(() => {
      this.services = [];
      this.formReSchedule.controls.type.reset();
      this.formReSchedule.controls.service.reset();
      this.formReSchedule.controls.professional.reset();
      this.service = null;
    });

    this.formReSchedule.get('type').valueChanges.subscribe(() => {
      this.services = [];
      this.formReSchedule.controls.service.reset();
      this.formReSchedule.controls.professional.reset();
      this.service = null;
      this.getServices();
    });

    this.formReSchedule.get('service').valueChanges.subscribe(() => {
      const id = this.formReSchedule.controls.working_day.value;
      const filterWorkingDay = this.workingDays.filter(data => data.value === id);
      this.workingDay = filterWorkingDay[0];
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
          this.workingDays.push({
            value: workingDay.id, label: workingDay.name,
            init_hour: workingDay.init_hour, end_hour: workingDay.end_hour
          });
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
    this.loaderService.loading(true);
    this.professionalService.get().subscribe(resp => {
      this.professionalsReSchedule = resp.data.filter((professional: any) => professional.status.openSchedule === 1);
      if (this.professionalsReSchedule.length > 0) {
        this.reservation = {
          type: this.scheduleService.SPORADIC_PERIODICITY,
          service: {
            working_day: {
              name: this.workingDay.label,
              init_hour: this.workingDay.init_hour,
              end_hour: this.workingDay.end_hour
            }
          }
        };
        this.scheduleService.checkAvailability(this.professionalsReSchedule, this.reservation, this.daysArray, '');
      }
      this.validateAvailability = true;
      this.loaderService.loading(false);
    }, () => {
      this.loaderService.loading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error'
      });
    });
  }

  selectProfessionals(professionalSelected: any) {
    this.formReSchedule.controls.professional.setValue(null);
    this.professional = professionalSelected;
    if (professionalSelected.available === 1) {
      this.formReSchedule.controls.professional.setValue(professionalSelected.id);
    }
    this.setSupervisors();
    this.loadSchedule();
    this.openCalendarModal.nativeElement.click();
  }

  loadSchedule() {
    const schedule = this.scheduleService.loadSchedule(this.professional, this.reservation, this.daysArray, '');
    setTimeout(() => {
      this.calendarOptions = {
        plugins: [listPlugin, timeGridPlugin, dayGridPlugin],
        locale: esLocale,
        height: 420,
        initialView: 'dayGridMonth',
        timeZone: 'America/Bogota',
        events: schedule,
        eventColor: '#378006',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        },
        slotEventOverlap: false,
        slotLabelFormat: [
          {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: false
          }
        ],
        expandRows: true,
        nowIndicator: true,
        dayHeaders: true,
      };
    }, 100);

  }

  setSupervisors() {
    this.supervisors = [];
    this.professionalsReSchedule.map((professional: any) => {
      if (professional.id !== this.professional.id) {
        this.supervisors.push({value: String(professional.id), label: professional.name + ' ' + professional.lastname});
        this.supervisors = this.supervisors.slice();
      }
    });
  }

}

