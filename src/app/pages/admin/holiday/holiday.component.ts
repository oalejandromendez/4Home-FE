import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/common';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { HolidayService } from 'src/app/services/admin/holiday/holiday.service';
import { UserService } from 'src/app/services/admin/user/user.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HolidayModel } from 'src/app/models/admin/holiday.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.scss']
})
export class HolidayComponent implements OnInit {

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  calendarOptions: CalendarOptions = {};

  holidays: Array<any> = [];

  form: FormGroup;
  submitted = false;
  id: any;
  holiday: HolidayModel = new HolidayModel();
  date = null;

  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private userService: UserService,
    private loaderService: LoaderService,
    private toastyService: ToastyService,
    private holidayService: HolidayService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loaderService.loading(true);
    this.getPermissions();
    this.loadForm();
  }

  ngOnInit(): void {
  }

  loadForm() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      date: new FormControl(null),
    });
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

    const that = this;

    this.holiday = this.form.value;
    this.holiday.date = this.date


    if (this.id) {

      this.holidayService.put( this.holiday, this.id).subscribe( (data: any)  => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El festivo se ha editado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);

        let calendarApi = this.calendarComponent.getApi();
        const event = calendarApi.getEventById(this.id);
        event.setProp('title', that.holiday.name);
        this.cancel();
        this.closeModal.nativeElement.click();

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
            this.router.navigateByUrl('/auth/login');
          }
        }
      });

    } else {

      this.holidayService.post( this.holiday ).subscribe( (data: any) => {
        Swal.close();
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El festivo se ha registrado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.form.reset();
        this.submitted = false;
        this.closeModal.nativeElement.click();

        let calendarApi = this.calendarComponent.getApi();
        setTimeout( () => {
          calendarApi.addEvent({
            id: data.id,
            title: that.holiday.name,
            start: that.date,
            color: 'red',
          });
        }, 100);

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
  }

  delete() {
    if (this.id && this.canDelete) {
      this.closeModal.nativeElement.click();
      Swal.fire({
        title: 'Esta seguro?',
        text:  'Usted no podra recuperar los datos eliminados',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: false,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Confirmar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return new Promise<void>((resolve) => {
            this.holidayService.delete(this.id).subscribe( data => {
              let calendarApi = this.calendarComponent.getApi();
              const event = calendarApi.getEventById(this.id);
              event.remove();
              this.cancel();
              Swal.fire('Proceso Exitoso!', 'Se ha eliminado el festivo exitosamente', 'success' );
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

  cancel() {
    this.id = null;
    this.form.reset();
    this.submitted = false;
    this.form.reset();
    this.date = null;
    if(!this.canCreate) {
      this.form.disable();
    }
  }

  open(modal: any) {
    this.modalService.open(modal, { windowClass: 'modal-professional'});
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  getHolidays() {
    this.holidayService.get().subscribe(resp => {

      this.holidays = resp.data.map( (holiday: any) => {
        return {
          id: holiday.id,
          title: holiday.name,
          start: holiday.date,
          color: 'red',
          allDay: true
        }
      });

      this.calendarOptions = {
        plugins: [ listPlugin, timeGridPlugin, dayGridPlugin ],
        locale: esLocale,
        height: 420,
        initialView: 'timeGridWeek',
        timeZone: 'America/Bogota',
        eventClick: this.eventClick.bind(this),
        dateClick: this.handleDateClick.bind(this),
        events: this.holidays,
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
      }

      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Ha ocurrido un error'
      });
    });
  }

  eventClick(arg: any) {
    if(arg && this.canEdit) {
      this.id = arg.event.id;
      const date = new Date(arg.event.start);
      date.setDate(date.getDate() + 1);
      this.form.controls.name.setValue(arg.event.title);
      this.date = date.toISOString().substring(0, 10);
      this.openModal.nativeElement.click();
    }
  }

  handleDateClick(arg: any) {
    if(arg && this.canCreate)  {
      this.date = arg.dateStr;
      this.openModal.nativeElement.click();
    } else {
      const toastOptions: ToastOptions = {
        title: 'Error',
        msg: 'No tiene permisos para crear festivos',
        showClose: false,
        timeout: 2000,
        theme: 'bootstrap',
      };
      this.toastyService.error(toastOptions);
    }
  }

  getPermissions() {
    const that = this;
    this.userService.permissions().subscribe( resp => {
      const create = resp.filter( (permission: any) => permission.name === 'CREAR_FESTIVOS');
      if(create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter( (permission: any) => permission.name === 'VER_FESTIVOS');
      if(see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter( (permission: any) => permission.name === 'MODIFICAR_FESTIVOS');
      if(edit.length >= 1) {
        that.canEdit = true;
      }
      const eliminar = resp.filter( (permission: any) => permission.name === 'ELIMINAR_FESTIVOS');
      if(eliminar.length >= 1) {
        that.canDelete = true;
      }
      this.getHolidays();
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
