import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {
  NgbCalendar,
  NgbDate,
  NgbDatepickerConfig,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {DataTableDirective} from 'angular-datatables';
import {ToastOptions, ToastyService} from 'ng2-toasty';
import {Subject, Subscription} from 'rxjs';
import {DataTableLanguage} from 'src/app/models/common/datatable';
import {ServicetypeService} from 'src/app/services/admin/servicetype/servicetype.service';
import {UserService} from 'src/app/services/admin/user/user.service';
import {DocumentTypeService} from 'src/app/services/common/documenttype/documenttype.service';
import {LoaderService} from 'src/app/services/common/loader/loader.service';
import {CustomerService} from 'src/app/services/scheduling/customer/customer.service';
import {ReserveService} from 'src/app/services/scheduling/reserve/reserve.service';
import {WorkingdayService} from 'src/app/services/admin/workingday/workingday.service';
import Swal from 'sweetalert2';
import {ServiceService} from 'src/app/services/admin/service/service.service';
import {CustomDatepickerI18n, I18n} from 'src/app/services/common/datepicker/datepicker.service';
import {HolidayService} from 'src/app/services/admin/holiday/holiday.service';
import {AuthService} from 'src/app/services/auth/auth.service';
import {ReserveModel} from 'src/app/models/scheduling/reserve.mode';
import {Router} from '@angular/router';
import {labels} from '@lang/labels/es_es';
import {texts} from '@lang/texts/es_es';
import {messages} from '@lang/messages/es_es';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class ReserveComponent implements OnInit, OnDestroy, AfterViewInit {

  labels = labels;
  texts = texts;
  messages = messages;

  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  @ViewChild('openModalPayment') openModalPayment: ElementRef;
  @ViewChild('closeModalPayment') closeModalPayment: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {};

  reservations: Array<any> = [];

  documentTypes: Array<any> = [];
  documentType = null;
  identification = null;

  isCustomer = false;
  customer = null;

  submitted = false;
  form: FormGroup;

  submittedPayment = false;
  formPayment: FormGroup;

  reserve: ReserveModel = new ReserveModel();

  serviceTypes: Array<any> = [];
  workingDays: Array<any> = [];
  services: Array<any> = [];
  listServices: Array<any> = [];
  service = null;

  types: Array<any> = [
    {
      value: 1,
      label: 'Esporádico'
    },
    {
      value: 2,
      label: 'Mensualidad'
    }
  ];

  id: any;

  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;

  today = this.calendar.getToday();
  now: Date = new Date();

  get daysArray() {
    return this.form.get('days') as FormArray;
  }

  disabledDates: NgbDateStruct[] = [];

  quantity = null;
  price = null;
  days: Array<any> = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  addresses: Array<any> = [];
  daysEdit: Array<any> = [];

  constructor(
    private userService: UserService,
    private loaderService: LoaderService,
    private toastyService: ToastyService,
    private documentTypeService: DocumentTypeService,
    private customerService: CustomerService,
    private language: DataTableLanguage,
    private reserveService: ReserveService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private servicetypeService: ServicetypeService,
    private workingdayService: WorkingdayService,
    private serviceService: ServiceService,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private I18n: I18n,
    private holidayService: HolidayService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loaderService.loading(true);
    this.getPermissions();
    this.loadForm();
    config.minDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1, day: this.now.getDate() + 2};
    config.maxDate = {year: 2200, month: 12, day: 31};
    config.navigation = 'arrows';
    this.I18n.language = 'es';
  }

  ngOnInit(): void {

    this.initialValidation();

    this.loadTable();
    this.getDocumentsType();
    this.getServiceTypes();
  }

  ngAfterViewInit() {
    this.reservations = [];
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  initialValidation() {
    const auth = this.authService.authUser();
    if (auth) {
      this.userService.getById(auth.id).subscribe(resp => {
        const roles = resp.roles.filter((rol: any) => rol.name === 'CLIENTE');
        if (roles.length > 0) {
          this.isCustomer = true;
          this.documentType = auth.type_document;
          this.identification = auth.identification;
          this.search();
        } else {
          this.isCustomer = false;
        }
      });
    }
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
    this.reserve.user = this.customer.id;

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

    if (this.id) {

      this.reserveService.put(this.reserve, this.id).subscribe(() => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'La reserva se ha editado exitosamente',
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
            this.router.navigateByUrl('/login');
          }
        }
      });

    } else {

      this.reserveService.post(this.reserve).subscribe(() => {
        Swal.close();
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'La reserva se ha registrado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.cancel();
        this.closeModal.nativeElement.click();
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

  }

  isDisabled = (date: NgbDateStruct, current: { month: number, year: number }) => {
    return this.disabledDates.find(x => NgbDate.from(x).equals(date)) ? true : false;
  };

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  getHolidays() {
    this.holidayService.get().subscribe(resp => {
      resp.data.map((holiday: any) => {
        const date = holiday.date.split('-');
        this.disabledDates.push({
          year: +date[0],
          month: +date[1],
          day: +date[2]
        });
      });
    });
  }

  loadForm() {
    this.form = new FormGroup({
      service_type: new FormControl(null, [Validators.required]),
      working_day: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      service: new FormControl(null, [Validators.required]),
      customer_address: new FormControl(null, [Validators.required]),
      user: new FormControl(null),
      days: this.formBuilder.array([], {validators: this.minDaySelected})
    });

    this.form.get('service_type').valueChanges.subscribe(resp => {
      this.workingDays = [];
      this.services = [];
      this.form.controls.working_day.reset();
      this.form.controls.type.reset();
      this.form.controls.service.reset();
      this.service = null;
      this.resetDays();
      this.getWorkingDays(resp);
    });

    this.form.get('working_day').valueChanges.subscribe(() => {
      this.services = [];
      this.form.controls.type.reset();
      this.form.controls.service.reset();
      this.service = null;
      this.resetDays();
    });

    this.form.get('type').valueChanges.subscribe(() => {
      this.services = [];
      this.form.controls.service.reset();
      this.service = null;
      this.resetDays();
      this.getServices();
    });

    this.form.get('service').valueChanges.subscribe(resp => {
      this.service = this.listServices.find(service => service.id === resp);
      if (this.reserve) {
        this.daysEdit = [];
      }
      if (this.form.controls.type.value === 1) {
        this.loadDates();
      }
      if (this.form.controls.type.value === 2) {
        this.loadDays();
      }
    });
  }

  minDaySelected: ValidatorFn = (form: FormArray) => {
    const days = form.controls.map(control => control.value.type === 2);
    const selected = form.controls.map(control => control.value.selected).reduce((prev, next) => next ? prev + next : prev, 0);
    return days.length === 7 ? selected !== this.quantity ? {invalidQuantity: true} : null : null;
  };

  resetDays() {
    this.quantity = null;
    this.price = null;
    this.daysEdit = [];
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0);
    }
  }

  loadDays() {
    if (this.service) {
      while (this.daysArray.length !== 0) {
        this.daysArray.removeAt(0);
      }
      this.quantity = this.service.quantity;
      if (this.service.type === 1) {
        this.price = this.quantity * this.service.price;
      } else {
        if (this.service.type === 2) {
          this.price = (this.quantity * this.service.price) * 4;
        }
      }
      this.days.map(day => {
        const editDay = this.daysEdit.find(day => day.day === this.daysArray.controls.length);
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
  }

  loadDates() {
    if (this.service) {
      while (this.daysArray.length !== 0) {
        this.daysArray.removeAt(0);
      }
      this.quantity = this.service.quantity;
      this.price = this.quantity * this.service.price;
      if (this.daysEdit.length > 0) {
        this.daysEdit.map(date => {
          const reserve_date = date.date.split('-');
          this.daysArray.push(
            this.formBuilder.group({
              index: new FormControl(this.daysArray.controls.length),
              date: new FormControl({
                year: +reserve_date[0],
                month: +reserve_date[1],
                day: +reserve_date[2]
              }, [Validators.required, this.validateDate.bind(this)]),
              type: 1
            })
          );
        });
      } else {
        for (var i = 0; i < this.quantity; i++) {
          this.daysArray.push(
            this.formBuilder.group({
              index: new FormControl(this.daysArray.controls.length),
              date: new FormControl(null, [Validators.required, this.validateDate.bind(this)]),
              type: 1
            })
          );
        }
      }
    }
  }

  validateDate(control: AbstractControl) {
    let exist = false;
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

  getServices() {
    const type = this.form.controls.type.value;
    const workingDay = this.form.controls.working_day.value;
    if (type && workingDay) {
      this.loaderService.loading(true);
      this.serviceService.findByTypeAndWorking(type, workingDay).subscribe(resp => {
        this.listServices = resp.data;
        resp.data.filter((service: any) => service.status === 1).map((service: any) => {
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

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  loadData() {
    if (this.customer) {
      this.reserveService.getByCustomer(this.customer.id).subscribe(resp => {
        this.reservations = resp;
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
          className: 'btn-sm boton-excel wid-6',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/añadir.png">',
          titleAttr: 'Nuevo Cliente',
          action(e: any) {
            that.cancel();
            that.openModal.nativeElement.click();
          }
        },
        {
          className: 'btn-sm boton-excel wid-6',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/excel.png">',
          titleAttr: 'Exportar como Excel',
          extend: 'excel',
          extension: '.xls',
          exportOptions: {
            columns: ':not(.notexport)'
          }
        },
        {
          className: 'btn-sm boton-copiar wid-6',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/copiar.png">',
          titleAttr: 'Copiar',
          extend: 'copy',
          extension: '.copy',
          exportOptions: {
            columns: ':not(.notexport)'
          }
        },
        {
          className: 'btn-sm boton-imprimir wid-6',
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
        {targets: 0, searchable: false, visible: false, className: 'notexport'}
      ],
      order: [],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

  open(modal: any) {
    this.modalService.open(modal, {size: 'lg'});
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  cancel() {
    this.daysEdit = new Array();
    this.id = null;
    this.submitted = null;
    this.reserve = new ReserveModel();
    this.form.reset();
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0);
    }
    if (!this.canCreate) {
      this.form.disable();
    }
    this.submittedPayment = null;
  }

  search() {

    if (this.documentType && this.identification) {

      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere...'
      });

      Swal.showLoading();

      const filter = {
        type_document: this.documentType,
        identification: this.identification
      };
      this.customerService.find(filter).subscribe(resp => {
        if (Object.keys(resp).length === 0) {
          if (this.customer) {
            this.reservations = [];
            this.rerender();
          }
          const that = this;
          setTimeout(function() {
            Swal.close();
            that.customer = null;
            that.addresses = [];
            const toastOptions: ToastOptions = {
              title: 'Error',
              msg: 'Cliente no encontrado',
              showClose: false,
              timeout: 5000,
              theme: 'bootstrap',
            };
            that.toastyService.error(toastOptions);
          }, 500);
        } else {
          if (this.reservations.length > 0) {
            this.reservations = [];
          }
          Swal.close();
          this.addresses = [];
          this.customer = resp;
          resp.customer_address.map((address: any) => {
            this.addresses.push({value: address.id, label: address.address});
            this.addresses = this.addresses.slice();
          });
          this.loadData();
        }
      });
    }
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

  getDocumentsType() {
    this.loaderService.loading(true);
    this.documentTypeService.get().subscribe((resp: any) => {
      resp.map((type: any) => {
        this.documentTypes.push({value: String(type.id), label: type.name});
        this.documentTypes = this.documentTypes.slice();
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

  edit(id: any) {
    if (id) {
      this.id = id;
      this.daysEdit = [];
      const that = this;
      const data = this.reservations.find((reservation: any) => reservation.id === id);
      this.reserve = data;
      if (data) {
        const promiseServiceType = async () => {
          this.form.controls.service_type.setValue(data.service.working_day.service_type);
          this.form.controls.working_day.setValue(data.service.working_day.id);
          this.form.controls.type.setValue(data.type);
          this.form.controls.service.setValue(data.service.id);
          return true;
        };
        promiseServiceType().then(() => {
          setTimeout(() => {
            that.form.controls.customer_address.setValue(data.customer_address.id);
            that.service = that.listServices.find(service => service.id === data.service.id);
            that.daysEdit = data.reserve_day;
            if (that.form.controls.type.value === 1) {
              that.loadDates();
            }
            if (that.form.controls.type.value === 2) {
              that.loadDays();
            }
            that.openModal.nativeElement.click();
          }, 2000);
        });
      }
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
            this.reserveService.delete(id).subscribe(data => {
              this.reservations.splice(index, 1);
              this.dtOptions = {};
              this.loadTable();
              this.rerender();
              this.cancel();
              Swal.fire('Proceso Exitoso!', 'Se ha eliminado la reserva exitosamente', 'success');
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

  payments(id: any) {
    const data = this.reservations.find((reservation: any) => reservation.id === id);
    if (data) {
      this.router.navigate(['/payment/' + btoa(data.reference)]);
    }
  }

  getPermissions() {
    const that = this;
    this.userService.permissions().subscribe(resp => {
      const create = resp.filter((permission: any) => permission.name === 'CREAR_RESERVAS');
      if (create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter((permission: any) => permission.name === 'VER_RESERVAS');
      if (see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter((permission: any) => permission.name === 'MODIFICAR_RESERVAS');
      if (edit.length >= 1) {
        that.canEdit = true;
      }
      const eliminar = resp.filter((permission: any) => permission.name === 'ELIMINAR_RESERVAS');
      if (eliminar.length >= 1) {
        that.canDelete = true;
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

  print(obj) {
    console.log(obj.year + '-' + obj.month + '-' + obj.day);
    return obj.day + '/' + obj.month + '/' + obj.day;
  }

}
