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
  days: Array<any> = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

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
  ) {
    this.getPermissions();
    this.loadForm();

    config.minDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1, day: this.now.getDate() + 2};
    config.maxDate = {year: 2200, month: 12, day: 31};
    this.I18n.language = 'es';
  }

  ngOnInit(): void {
    this.search = '';
    this.reserves = new Array();
    this.cancel();
    this.getReserves();
  }

  checkAvailability() {


    this.loaderService.loading(true);
    const listDays = [];
    const days = JSON.parse(JSON.stringify(this.daysArray.value));
    days.map((day: any) => {
      if (day.type === 1 && !day.disabled) {
        const date = day.date;
        listDays.push({
          date: date.year + '-' + date.month + '-' + date.day
        });
      }
      if (day.type === 2 && day.selected) {
        listDays.push({
          day: day.index++
        });
      }
    });
    const filter = {
      type: this.reservation.type,
      days: listDays
    };
    this.loaderService.loading(true);
    this.professionalService.get().subscribe(resp => {
      this.professionals = resp.data.filter((professional: any) => professional.status.openSchedule === 1);
      this.professionalService.checkAvailability(filter).subscribe((resp: any) => {
        if (this.professionals.length > 0) {
          this.professionals.map((professional: any) => {
            const available = resp.find((o: any) => o.id === professional.id);
            if (available) {
              professional.available = 1;
            } else {
              professional.available = 2;
            }
          });
        }
        this.validateAvailability = true;
        this.loaderService.loading(false);
      }, error => {
        this.loaderService.loading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error'
        });
      });
    }, error => {
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

    const listDays = [];

    this.daysArray.value.map((day: any) => {
      if (day.type === 1) {
        const date = day.date;
        listDays.push({
          date: date.year + '-' + date.month + '-' + date.day
        });
      }
      if (day.type === 2 && day.selected) {
        listDays.push({
          day: day.index++
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
      if (this.professional.reserve) {
        const reservesDates = this.professional.reserve.filter((reserve: any) => reserve.type === 1);

        if (reservesDates.length > 0) {
          reservesDates.map((reserve: any) => {
            reserve.reserve_day.map((day: any) => {
              this.schedule.push({
                title: reserve.service.working_day.name,
                start: day.date,
                color: '#f44336',
                allDay: true
              });
            });
          });
        }

        const reservesDays = this.professional.reserve.filter((reserve: any) => reserve.type === 2);

        if (reservesDays.length > 0) {
          reservesDays.map((reserve: any) => {
            const days = reserve.reserve_day;
            if (days.length > 0) {
              const now = new Date(reserve.created_at);
              const limit = new Date();
              limit.setMonth(now.getMonth() + 1);
              while (now <= limit) {
                let day = now.getDay();
                if (day === 0) {
                  day = 6;
                } else {
                  day--;
                }
                const exists = days.find((d: any) => d.day === day);
                if (exists) {
                  this.schedule.push({
                    title: reserve.service.working_day.name,
                    start: new Date(now),
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

    const dates = this.daysArray.value.filter((day: any) => day.type === 1 && !day.disabled);
    if (dates.length > 0) {
      dates.map((day: any) => {
        const date = day.date;
        this.schedule.push({
          title: this.reservation.service.working_day.name,
          start: new Date(date.year + '-' + date.month + '-' + date.day),
          color: '#03a9f4',
          allDay: true
        });
      });
    }
    const days = this.daysArray.value.filter((day: any) => day.type === 2 && day.selected);
    if (days.length > 0) {
      const now = new Date();
      const limit = new Date();
      limit.setMonth(now.getMonth() + 1);
      while (now <= limit) {
        let day = now.getDay();
        if (day === 0) {
          day = 6;
        } else {
          day--;
        }
        const exists = days.find((d: any) => d.index === day);
        if (exists) {
          this.schedule.push({
            title: this.reservation.service.working_day.name,
            start: new Date(now),
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
        dayHeaders: true
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
      this.loadDates();
    }
    if (this.reservation.type === 2) {
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

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
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
