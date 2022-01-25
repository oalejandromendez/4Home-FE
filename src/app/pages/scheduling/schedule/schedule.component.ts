import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {FullCalendarComponent} from '@fullcalendar/angular';
import {CalendarOptions} from '@fullcalendar/common';
import {NgbCalendar, NgbDate, NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastOptions, ToastyService} from 'ng2-toasty';
import {ReserveModel} from 'src/app/models/scheduling/reserve.mode';
import {ProfessionalService} from 'src/app/services/admin/professional/professional.service';
import {UserService} from 'src/app/services/admin/user/user.service';
import {CustomDatepickerI18n, I18n} from 'src/app/services/common/datepicker/datepicker.service';
import {LoaderService} from 'src/app/services/common/loader/loader.service';
import {ReserveService} from 'src/app/services/scheduling/reserve/reserve.service';
import {ScheduleService} from 'src/app/services/scheduling/schedule/schedule.service';
import Swal from 'sweetalert2';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import {labels} from '@lang/labels/es_es';
import {texts} from '@lang/texts/es_es';
import {messages} from '@lang/messages/es_es';
import {NoveltyService} from '@src/services/admin/novelty/novelty.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class ScheduleComponent implements OnInit {

  labels = labels;
  texts = texts;
  messages = messages;

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  search = '';
  searchProfessional = '';

  calendarOptions: CalendarOptions = {};

  reserves: Array<any> = [];
  reserve: ReserveModel = new ReserveModel();
  reservation = null;

  submitted = false;
  form: FormGroup;

  get daysArray() {
    return this.form.get('days') as FormArray;
  }

  quantity = null;
  price = null;
  days: Array<any> = [];

  today = this.calendar.getToday();
  now: Date = new Date();

  disabledDates: NgbDateStruct[] = [];

  professionals: Array<any> = [];
  supervisors: Array<any> = [];
  professional = null;
  validateAvailability = false;

  schedules: Array<any> = [];
  schedule: Array<any> = [];

  states: Array<any> = [
    {
      value: 1,
      label: 'Pre-Agendamientos'
    },
    {
      value: 2,
      label: 'Agendamientos sin pago'
    },
    {
      value: 3,
      label: 'Pagos vencidos'
    },
    {
      value: 9,
      label: 'Reprogramaciones'
    }
  ];

  state = 1;

  canSee = false;
  canEdit = false;

  constructor(
    private reserveService: ReserveService,
    private loaderService: LoaderService,
    private userService: UserService,
    private toastyService: ToastyService,
    private formBuilder: FormBuilder,
    private calendar: NgbCalendar,
    private I18n: I18n,
    private config: NgbDatepickerConfig,
    private professionalService: ProfessionalService,
    private modalService: NgbModal,
    private scheduleService: ScheduleService,
    private router: Router,
    public dateService: CustomDatepickerI18n,
    private noveltyService: NoveltyService
  ) {
    this.getPermissions();
    this.loadForm();

    config.minDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1, day: this.now.getDate() + 2};
    config.maxDate = {year: 2200, month: 12, day: 31};
    this.I18n.language = 'es';
    this.days = this.scheduleService.DAYS;
  }

  ngOnInit(): void {
    this.search = '';
    this.reserves = [];
    this.cancel();
    this.getReserves();
  }

  checkAvailability() {

    this.submitted = true;

    if (this.reservation.type === this.scheduleService.MONTHLY_PERIODICITY) {
      if (!this.form.controls.initial_service_date.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: texts.initial_service_date_required
        });
        return;
      }
    }

    this.loaderService.loading(true);
    this.professionalService.get().subscribe(resp => {
      this.professionals = resp.data.filter((professional: any) => professional.status.openSchedule === 1);
      if (this.professionals.length > 0) {
        this.scheduleService.checkAvailability(this.professionals, this.reservation, this.daysArray,
          (this.form.controls.initial_service_date) ? this.form.controls.initial_service_date.value : '');
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

  onSubmit() {

    this.submitted = true;

    if (!this.form.controls.professional.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: texts.professional_not_available
      });
      return;
    }

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

    this.reserve = this.form.value;
    if (this.reservation.type === this.scheduleService.MONTHLY_PERIODICITY) {
      const iDate = this.form.controls.initial_service_date.value;
      this.reserve.initial_service_date = `${iDate.year}-${iDate.month}-${iDate.day}`;
    }

    const listDays = [];

    this.daysArray.value.map((day: any) => {
      if (day.type === this.scheduleService.SPORADIC_PERIODICITY) {
        const date = day.date;
        listDays.push({
          date: date.year + '-' + date.month + '-' + date.day
        });
      }
      if (day.type === this.scheduleService.MONTHLY_PERIODICITY && day.selected) {
        listDays.push({
          day: day.index
        });
      }
    });

    this.reserve.days = listDays;
    this.reserve.id = this.reservation.id;

    this.scheduleService.post(this.reserve).subscribe(() => {
      Swal.close();
      const toastOptions: ToastOptions = {
        title: '¡Proceso Exitoso!',
        msg: 'Se ha agendado la reserva exitosamente',
        showClose: false,
        timeout: 3000,
        theme: 'bootstrap',
      };
      this.toastyService.success(toastOptions);
      this.refresh();
      this.closeModal.nativeElement.click();
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

  loadSchedule() {
    this.schedule = [];
    if (this.professional) {
      if (this.professional.novelties) {
        this.professional.novelties.map((novelty: any) => {
          const initialNoveltyDateSplit = novelty.initial_date.split('-');
          const initialNoveltyDate = new Date(initialNoveltyDateSplit[0], initialNoveltyDateSplit[1] - 1, initialNoveltyDateSplit[2]);
          const finalNoveltyDateSplit = novelty.final_date.split('-');
          const finalNoveltyDate = new Date(finalNoveltyDateSplit[0], finalNoveltyDateSplit[1] - 1, finalNoveltyDateSplit[2]);

          while (initialNoveltyDate <= finalNoveltyDate) {
            const title = this.noveltyService.Type.filter(data => data.value === novelty.type);

            this.schedule.push({
              title: `${title[0].label}`,
              start: new Date(initialNoveltyDate),
              color: '#13f403',
              allDay: true
            });

            initialNoveltyDate.setDate(initialNoveltyDate.getDate() + 1);
          }
        });
      }
      if (this.professional.reserve) {
        const reservesDates = this.professional.reserve.filter((reserve: any) =>
          reserve.type === this.scheduleService.SPORADIC_PERIODICITY);

        if (reservesDates.length > 0) {
          reservesDates.map((reserve: any) => {
            reserve.reserve_day.map((day: any) => {
              this.schedule.push({
                title: `${reserve.service.working_day.name} (${reserve.service.working_day.init_hour} - ${reserve.service.working_day.end_hour})`,
                start: day.date,
                color: '#f44336',
                allDay: true
              });
            });
          });
        }

        const reservesDays = this.professional.reserve.filter((reserve: any) => reserve.type === this.scheduleService.MONTHLY_PERIODICITY);

        if (reservesDays.length > 0) {
          reservesDays.map((reserve: any) => {
            const days = reserve.reserve_day;
            if (days.length > 0) {
              const now = new Date(reserve.initial_service_date);
              now.setDate(now.getDate() + 1);
              const limit = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() + 1);
              while (now <= limit) {
                const day = now.getDay();
                const exists = days.find((d: any) => d.day === day);
                if (exists) {
                  this.schedule.push({
                    title: `${reserve.service.working_day.name} (${reserve.service.working_day.init_hour} - ${reserve.service.working_day.end_hour})`,
                    start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                    color: '#f44336',
                    allDay: true
                  });
                }
                now.setDate(now.getDate() + 1);
              }
            }
          });
        }
      }
    }

    const dates = this.daysArray.value.filter((day: any) => day.type === this.scheduleService.SPORADIC_PERIODICITY && !day.disabled);
    if (dates.length > 0) {
      dates.map((day: any) => {
        const date = day.date;
        this.schedule.push({
          title: `${this.reservation.service.working_day.name} (${this.reservation.service.working_day.init_hour} - ${this.reservation.service.working_day.end_hour})`,
          start: new Date(date.year + '-' + date.month + '-' + date.day),
          color: '#03a9f4',
          allDay: true
        });
      });
    }
    const days = this.daysArray.value.filter((day: any) => day.type === this.scheduleService.MONTHLY_PERIODICITY && day.selected);
    if (days.length > 0) {
      const initialServiceDate = this.form.controls.initial_service_date.value;
      const now = new Date(initialServiceDate.year, initialServiceDate.month - 1, initialServiceDate.day);
      const limit = new Date(initialServiceDate.year, initialServiceDate.month - 1, initialServiceDate.day);
      limit.setMonth(now.getMonth() + 1);
      while (now <= limit) {
        const day = now.getDay();
        const exists = days.find((d: any) => d.index === day);
        if (exists) {
          this.schedule.push({
            title: `${this.reservation.service.working_day.name} (${this.reservation.service.working_day.init_hour} - ${this.reservation.service.working_day.end_hour})`,
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            color: '#03a9f4',
            allDay: true
          });
        }
        now.setDate(now.getDate() + 1);
      }
    }
    setTimeout(() => {
      this.calendarOptions = {
        plugins: [listPlugin, timeGridPlugin, dayGridPlugin],
        locale: esLocale,
        height: 420,
        initialView: 'dayGridMonth',
        timeZone: 'America/Bogota',
        events: this.schedule,
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

  selectProfessionals(professional: any) {
    this.form.controls.professional.setValue(null);
    this.professional = professional;
    if (professional.available === 1) {
      this.form.controls.professional.setValue(this.professional.id);
    }
    this.setSupervisors();
    this.loadSchedule();
    this.openModal.nativeElement.click();
  }

  setSupervisors() {
    this.supervisors = [];
    this.professionals.map((professional: any) => {
      if (professional.id !== this.professional.id) {
        this.supervisors.push({value: String(professional.id), label: professional.name + ' ' + professional.lastname});
        this.supervisors = this.supervisors.slice();
      }
    });
  }

  loadForm() {
    this.form = new FormGroup({
      professional: new FormControl(null, [Validators.required]),
      supervisor: new FormControl(null, [Validators.required]),
      days: this.formBuilder.array([], {validators: this.minDaySelected})
    });
    this.form.get('days').valueChanges.subscribe(changes => {
      this.validateAvailability = false;
    });
  }

  minDaySelected: ValidatorFn = (form: FormArray) => {
    const days = form.controls.map(control => control.value.type === 2);
    const selected = form.controls.map(control => control.value.selected).reduce((prev, next) => next ? prev + next : prev, 0);
    return days.length === 7 ? selected !== this.reservation.service.quantity ? {invalidQuantity: true} : null : null;
  };

  getSchedule() {
    this.loaderService.loading(true);
    this.scheduleService.get().subscribe(resp => {
      this.schedules = resp;
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

  getReserves() {
    this.loaderService.loading(true);
    this.reserveService.getByStatus(this.state).subscribe(resp => {
      this.reserves = resp;
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

  selectReserve(reserve: any) {
    this.cancel();
    this.reservation = reserve;
    if (this.reservation.type === 1) {
      if (this.form.controls.initial_service_date) {
        this.form.removeControl('initial_service_date');
      }
      this.loadDates();
    }
    if (this.reservation.type === 2) {
      this.form.addControl('initial_service_date', new FormControl(null, [Validators.required]));
      this.loadDays();
    }
  }

  loadDates() {
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0);
    }
    this.reservation.reserve_day.map((date: any) => {
      const reserve_date = date.date.split('-');
      const validate = new Date(+reserve_date[0], +reserve_date[1] - 1, +reserve_date[2]);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      this.daysArray.push(
        this.formBuilder.group({
          index: new FormControl(this.daysArray.controls.length),
          date: new FormControl({
            year: +reserve_date[0],
            month: +reserve_date[1],
            day: +reserve_date[2]
          }, [Validators.required, this.validateDate.bind(this)]),
          type: 1,
          disabled: validate < now ? true : false
        }, {validators: Validators.compose([this.ValidateDisabledDate])})
      );
    });
  }

  loadDays() {
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0);
    }
    this.days.map(day => {
      const editDay = this.reservation.reserve_day.find((day: any) => day.day === this.daysArray.controls.length);
      this.daysArray.push(
        this.formBuilder.group({
          index: new FormControl(this.daysArray.controls.length),
          day: new FormControl(day),
          selected: new FormControl(editDay === undefined ? false : true),
          type: 2
        })
      );
    });
  }

  ValidateDisabledDate: ValidatorFn = (formG: FormGroup) => {
    let date = formG.get('date').value;
    const disabled = formG.get('disabled').value;
    let dateLimit: string;
    const now = new Date();
    if (date) {
      date = date.year + '-' + (date.month < 10 ? '0' + date.month : date.month) + '-' + (date.day < 10 ? '0' + date.day : date.day);
      // tslint:disable-next-line:max-line-length
      dateLimit = now.getFullYear() + '-' + ((now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1)) + '-' + (now.getDate() + 1 < 10 ? '0' + now.getDate() + 1 : now.getDate() + 1);
    }
    return disabled === false ? date !== null ? date > dateLimit ? null : {invalidDate: true} : null : null;
  };

  validateDate(control: AbstractControl) {
    let exist = false;
    const date = new Date(+control.value.year, +control.value.month - 1, +control.value.day);
    const validate = new Date();
    validate.setDate(validate.getDate() + 1);
    if (this.daysArray.length > 0 && !this.form.pristine) {
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

  isDisabled = (date: NgbDateStruct, current: { month: number, year: number }) => {
    return this.disabledDates.find(x => NgbDate.from(x).equals(date)) ? true : false;
  };

  refresh() {
    this.cancel();
    this.getReserves();
  }

  cancel() {
    this.reservation = null;
    this.submitted = false;
    this.validateAvailability = false;
    this.professional = null;
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0);
    }
    this.form.reset();
  }

  open(modal: any) {
    this.modalService.open(modal, {windowClass: 'modal-schedule'});
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  getPermissions() {
    const that = this;
    this.loaderService.loading(true);
    this.userService.permissions().subscribe(resp => {
      const see = resp.filter((permission: any) => permission.name === 'VER_AGENDAMIENTOS');
      if (see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter((permission: any) => permission.name === 'MODIFICAR_AGENDAMIENTOS');
      if (edit.length >= 1) {
        that.canEdit = true;
      }
      this.loaderService.loading(false);

      if (that.canSee) {
        this.getReserves();
      }

    }, error => {
      const toastOptions: ToastOptions = {
        title: 'Error',
        msg: 'El ususario no tiene roles',
        showClose: false,
        timeout: 2000,
        theme: 'bootstrap',
      };
      this.toastyService.error(toastOptions);
      this.loaderService.loading(false);
    });
  }
}
