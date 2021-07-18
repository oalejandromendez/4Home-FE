import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Subject, Subscription } from 'rxjs';
import { ReserveModel } from 'src/app/models/scheduling/reserve.mode';
import { ServiceService } from 'src/app/services/admin/service/service.service';
import { UserService } from 'src/app/services/admin/user/user.service';
import { WorkingdayService } from 'src/app/services/admin/workingday/workingday.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DocumentTypeService } from 'src/app/services/common/documenttype/documenttype.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { CustomerService } from 'src/app/services/scheduling/customer/customer.service';
import { ReserveService } from 'src/app/services/scheduling/reserve/reserve.service';
import { CustomDatepickerI18n, I18n } from 'src/app/services/common/datepicker/datepicker.service';
import Swal from 'sweetalert2';
import { ServicetypeService } from 'src/app/services/admin/servicetype/servicetype.service';
import { DataTableLanguage } from 'src/app/models/common/datatable';
import { ScheduleService } from 'src/app/services/scheduling/schedule/schedule.service';

@Component({
  selector: 'app-reschedule',
  templateUrl: './reschedule.component.html',
  styleUrls: ['./reschedule.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class RescheduleComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  @ViewChild('openModalPayment') openModalPayment: ElementRef;
  @ViewChild('closeModalPayment') closeModalPayment: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {};
  private subscription: Subscription;

  documentTypes: Array<any> = new Array();
  documentType = null;
  identification = null;

  isCustomer = false;
  customer = null;
  addresses: Array<any> = [];
  reservations: Array<any> = new Array();
  workingDays: Array<any> = [];
  services: Array<any> = [];
  listServices: Array<any> = [];
  service = null;

  submitted = false;
  form: FormGroup;

  quantity = null;
  price = null;
  days: Array<any> = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  daysEdit: Array<any> = [];
  reserve: ReserveModel = new ReserveModel();
  disabledDates: NgbDateStruct[] = [];
  serviceTypes: Array<any> = [];
  types: Array<any> = [
    {
      value: 1,
      label: "Esporádico"
    },
    {
      value: 2,
      label: "Mensualidad"
    }
  ];

  get daysArray() {
    return this.form.get('days') as FormArray;
  }

  id: any;

  now: Date = new Date();

  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private userService: UserService,
    private toastyService: ToastyService,
    private loaderService: LoaderService,
    private authService: AuthService,
    private customerService: CustomerService,
    private reserveService: ReserveService,
    private documentTypeService: DocumentTypeService,
    private formBuilder: FormBuilder,
    private workingdayService: WorkingdayService,
    private serviceService: ServiceService,
    private modalService: NgbModal,
    private router: Router,
    private servicetypeService: ServicetypeService,
    private language: DataTableLanguage,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private I18n: I18n,
    private scheduleService: ScheduleService
  ) {
    this.getPermissions();
    this.loadForm();
    config.minDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1 , day: this.now.getDate() + 2};
    config.maxDate = {year: 2200, month: 12, day: 31};
    this.I18n.language = 'es';
  }

  ngOnInit(): void {
    this.initialValidation();
    this.getServiceTypes();
    this.getDocumentsType();
    this.loadTable();
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
    if(auth) {
      this.userService.getById(auth.id).subscribe( resp => {
        const roles = resp.roles.filter( (rol: any) => rol.name === 'CLIENTE');
        if( roles.length > 0) {
          this.isCustomer = true;
          this.documentType = auth.type_document;
          this.identification = auth.identification;
          this.search();
        } else {
          this.isCustomer = false;
        }
      })
    }
  }

  getServiceTypes() {
    this.loaderService.loading(true);
    this.servicetypeService.get().subscribe( (resp: any) => {
      resp.data.filter( (serviceType: any) => serviceType.status === 1 ).map( (serviceType: any) => {
        this.serviceTypes.push({ value: serviceType.id, label: serviceType.name } );
        this.serviceTypes = this.serviceTypes.slice();
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

  getDocumentsType() {
    this.loaderService.loading(true);
    this.documentTypeService.get().subscribe( (resp: any) => {
      resp.map( (type: any) => {
        this.documentTypes.push({ value: String(type.id), label: type.name } );
        this.documentTypes = this.documentTypes.slice();
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

  search() {
    if(this.documentType && this.identification) {
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text:  'Espere...'
      });
      Swal.showLoading();
      const filter = {
        type_document: this.documentType,
        identification: this.identification
      }

      this.customerService.find(filter).subscribe( resp => {
        if(Object.keys(resp).length === 0) {
          if(this.customer) {
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
          if(this.reservations.length > 0) {
            this.reservations = [];
          }
          Swal.close();
          this.addresses = [];
          this.customer = resp;
          resp.customer_address.map( (address: any) => {
            this.addresses.push({ value: address.id, label: address.address } );
            this.addresses = this.addresses.slice();
          });
          this.loadData();
        }
      });
    }
  }

  loadForm() {
    this.form = new FormGroup({
      service_type: new FormControl(null, [Validators.required]),
      working_day: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      service: new FormControl(null, [Validators.required]),
      customer_address: new FormControl(null, [Validators.required]),
      user: new FormControl(null),
      days: this.formBuilder.array([], {validators: this.minDaySelected })
    });

    this.form.get('service_type').valueChanges.subscribe( resp => {
      this.workingDays = new Array();
      this.services = new Array();
      this.form.controls.working_day.reset();
      this.form.controls.type.reset();
      this.form.controls.service.reset();
      this.service = null;
      this.resetDays();
      this.getWorkingDays(resp);
    });

    this.form.get('working_day').valueChanges.subscribe( resp => {
      this.services = new Array();
      this.form.controls.type.reset();
      this.form.controls.service.reset();
      this.service = null;
      this.resetDays();
    });

    this.form.get('type').valueChanges.subscribe( resp => {
      this.services = new Array();
      this.form.controls.service.reset();
      this.service = null;
      this.resetDays();
      this.getServices();
    });

    this.form.get('service').valueChanges.subscribe( resp => {
      this.service = this.listServices.find( service => service.id === resp);
      if(this.reserve) {
        this.daysEdit = new Array();
      }
      if(this.form.controls.type.value === 1) {
        this.loadDates();
      }
      if(this.form.controls.type.value === 2) {
        this.loadDays();
      }
    });
  }

  minDaySelected: ValidatorFn = (form: FormArray) => {
    const days = form.controls.map( control => control.value.type === 2);
    const selected = form.controls.map( control => control.value.selected).reduce( (prev, next) => next ? prev + next : prev, 0);
    return days.length === 7 ? selected !== this.quantity ? { invalidQuantity : true} : null : null;
  }

  resetDays() {
    this.quantity = null;
    this.price = null;
    this.daysEdit = new Array();
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0)
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
        { targets: 0, searchable: false, visible: false, className: 'notexport' }
      ],
      order: [],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

  getWorkingDays(serviceType: string) {
    if(serviceType) {
      this.loaderService.loading(true);
      this.workingdayService.findByServiceType(serviceType).subscribe( resp => {
        resp.data.filter( (workingDay: any) => workingDay.status === 1 ).map( (workingDay: any) => {
          this.workingDays.push({ value: workingDay.id, label: workingDay.name } );
          this.workingDays = this.workingDays.slice();
        });
        this.loaderService.loading(false);
      }, error => {
        this.loaderService.loading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:  'Ha ocurrido un error'
        });
      });
    }
  }

  getServices() {
    const type = this.form.controls.type.value;
    const workingDay = this.form.controls.working_day.value;
    if(type && workingDay) {
      this.loaderService.loading(true);
      this.serviceService.findByTypeAndWorking(type, workingDay).subscribe( resp => {
        this.listServices = resp.data;
        resp.data.filter( (service: any) => service.status === 1 ).map( (service: any) => {
          this.services.push({ value: service.id, label: service.name } );
          this.services = this.services.slice();
        });
        this.loaderService.loading(false);
      }, error => {
        this.loaderService.loading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:  'Ha ocurrido un error'
        });
      });
    }
  }

  loadDates() {
    if(this.service) {
      while (this.daysArray.length !== 0) {
        this.daysArray.removeAt(0)
      }
      this.quantity = this.service.quantity;
      this.price = this.quantity * this.service.price;
      if(this.daysEdit.length > 0) {
        this.daysEdit.map( date => {
          const reserve_date = date.date.split('-');
          const validate = new Date(+reserve_date[0], +reserve_date[1]-1, +reserve_date[2]);
          const now = new Date();
          now.setHours(0,0,0,0);
          this.daysArray.push(
            this.formBuilder.group({
              index: new FormControl(this.daysArray.controls.length),
              date: new FormControl({ year: +reserve_date[0], month: +reserve_date[1], day: +reserve_date[2]} , [Validators.required, this.validateDate.bind(this)]),
              type: 1,
              disabled: validate < now ? true : false
            }, {validators: Validators.compose([this.ValidateDisabledDate])})
          );
        });
      } else {
        for(var i = 0; i < this.quantity; i++ ) {
          this.daysArray.push(
            this.formBuilder.group({
              index: new FormControl(this.daysArray.controls.length),
              date: new FormControl(null, [Validators.required, this.validateDate.bind(this)]),
              type: 1
            })
          )
        }
      }
    }
  }

  ValidateDisabledDate: ValidatorFn = (formG: FormGroup) => {
    let date = formG.get('date').value;
    let disabled = formG.get('disabled').value;
    let dateLimit: string;
    const now  = new Date();
    if (date) {
      date = date.year + '-' + (date.month < 10 ? '0' + date.month : date.month ) + '-' + (date.day < 10 ? '0' + date.day : date.day) ;
      dateLimit = now.getFullYear() + '-' + ( (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1) ) + '-' + (now.getDate() + 1 < 10 ? '0' + now.getDate() + 1 : now.getDate() + 1);
    }
    return disabled === false ? date !== null ?  date > dateLimit ? null : { invalidDate: true } : null : null;
  }

  validateDate(control: AbstractControl) {
    var exist = false;
    const date = new Date(+control.value.year, +control.value.month-1, +control.value.day);
    const validate = new Date();
    validate.setDate( validate.getDate() + 1);
    if(this.daysArray.length > 0 && !this.form.pristine) {
      this.daysArray.controls.map( o => {
        if(o.value.date != null) {
          if(o.value.date.year === control.value.year &&
            o.value.date.month === control.value.month &&
            o.value.date.day === control.value.day
            ) {
            exist = true;
          }
        }
      });
    }
    return exist ? { 'repeatedDate': true } : null;
  }

  loadDays() {
    if(this.service) {
      while (this.daysArray.length !== 0) {
        this.daysArray.removeAt(0)
      }
      this.quantity = this.service.quantity;
      this.price = this.quantity * this.service.price;
      this.days.map( day => {
        const editDay = this.daysEdit.find( day => day.day === this.daysArray.controls.length);
        this.daysArray.push(
          this.formBuilder.group({
            index: new FormControl(this.daysArray.controls.length),
            day: new FormControl(day),
            selected: new FormControl( editDay === undefined ? false : true),
            type: 2
          })
        )
      });
    }
  }

  isDisabled = (date: NgbDateStruct, current: {month: number,year: number})=> {
    return this.disabledDates.find(x => NgbDate.from(x).equals(date))? true: false;
  }

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
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

    this.reserve = this.form.value;
    this.reserve.user = this.customer.id;

    const listDays = new Array();

    this.daysArray.value.map( (day: any) => {
      if(day.type === 1 ) {
        const date = day.date;
        listDays.push({
          date: date.year + '-' + date.month + '-' + date.day
        });
      }
      if(day.type === 2 && day.selected) {
        listDays.push({
          day: day.index++
        });
      }
    });
    this.reserve.days = listDays;
    this.reserve.id = this.id;
    if (this.id) {
      this.scheduleService.reschedule( this.reserve).subscribe( (data: any)  => {
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'La reserva se ha reprogramado exitosamente',
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

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  loadData() {
    if(this.customer) {
      this.reserveService.getScheduleByCustomer(this.customer.id).subscribe(resp => {
        this.reservations = resp;
        this.dtTrigger.next();
        this.loaderService.loading(false);
      }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:  'Ha ocurrido un error'
        });
      });
    }
  }

  open(modal: any) {
    this.modalService.open(modal, { size: 'lg'});
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  edit(id: any) {
    if(id) {
      this.id = id;
      this.daysEdit = new Array();
      const that = this;
      const data = this.reservations.find( (reservation: any) => reservation.id === id);
      this.reserve = data;
      if (data) {
        const promiseServiceType = async () => {
          this.form.controls.service_type.setValue(data.service.working_day.service_type);
          this.form.controls.working_day.setValue(data.service.working_day.id);
          this.form.controls.type.setValue(data.type);
          this.form.controls.service.setValue(data.service.id);
          return true;
        }
        promiseServiceType().then( result => {
          setTimeout(function() {
            that.form.controls.customer_address.setValue(data.customer_address.id);
            that.service = that.listServices.find( service => service.id === data.service.id);
            that.daysEdit = data.reserve_day;
            if(that.form.controls.type.value === 1) {
              that.loadDates();
            }
            if(that.form.controls.type.value === 2) {
              that.loadDays();
            }
            that.openModal.nativeElement.click();
          }, 2000);
        });
      }
    }
  }

  cancel() {
    this.daysEdit = new Array();
    this.id = null;
    this.submitted = null;
    this.reserve = new ReserveModel();
    this.form.reset();
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0)
    }
    if(!this.canCreate) {
      this.form.disable();
    }
  }

  getPermissions() {
    const that = this;
    this.userService.permissions().subscribe( resp => {
      const create = resp.filter( (permission: any) => permission.name === 'CREAR_REPROGRAMACIONES');
      if(create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter( (permission: any) => permission.name === 'VER_REPROGRAMACIONES');
      if(see.length >= 1) {
        that.canSee = true;
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
