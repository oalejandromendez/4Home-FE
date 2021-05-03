import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Subject, Subscription } from 'rxjs';
import { DataTableLanguage } from 'src/app/models/common/datatable';
import { ServicetypeService } from 'src/app/services/admin/servicetype/servicetype.service';
import { UserService } from 'src/app/services/admin/user/user.service';
import { DocumentTypeService } from 'src/app/services/common/documenttype/documenttype.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { CustomerService } from 'src/app/services/scheduling/customer/customer.service';
import { ReserveService } from 'src/app/services/scheduling/reserve/reserve.service';
import { WorkingdayService } from 'src/app/services/admin/workingday/workingday.service';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/services/admin/service/service.service';
import { CustomDatepickerI18n, I18n } from 'src/app/services/common/datepicker/datepicker.service';
import { HolidayService } from 'src/app/services/admin/holiday/holiday.service';
import { AuthService } from 'src/app/services/auth/auth.service'

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class ReserveComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {};
  private subscription: Subscription;

  reservations: Array<any> = new Array();

  documentTypes: Array<any> = new Array();
  documentType = null;
  identification = null;

  isCustomer = false;
  customer = null;

  submitted = false;
  form: FormGroup;

  serviceTypes: Array<any> = [];
  workingDays: Array<any> = [];
  services: Array<any> = [];
  listServices: Array<any> = [];
  service = null;

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
    private authService: AuthService
    ) {
      this.loaderService.loading(true);
      this.getPermissions();
      this.loadForm();

      config.minDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1 , day: this.now.getDate() + 2};
      config.maxDate = {year: 2200, month: 12, day: 31};
      this.I18n.language = 'es';
    }

  ngOnInit(): void {

    this.initialValidation();

    this.loadTable();
    this.getDocumentsType();
    this.getServiceTypes();
    this.getHolidays();
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
      console.log('auth', auth);
      this.userService.getById(auth.id).subscribe( resp => {
        console.log('resp', resp);
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

  onSubmit() {

  }

  isDisabled = (date: NgbDateStruct, current: {month: number,year: number})=> {
    return this.disabledDates.find(x => NgbDate.from(x).equals(date))? true: false;
  }

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  getHolidays() {
    this.holidayService.get().subscribe( resp => {
      resp.data.map( (holiday: any) => {
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
      address: new FormControl(null, [Validators.required]),
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
    while (this.daysArray.length !== 0) {
      this.daysArray.removeAt(0)
    }
  }

  loadDays() {
    if(this.service) {
      while (this.daysArray.length !== 0) {
        this.daysArray.removeAt(0)
      }
      this.quantity = this.service.quantity;
      this.price = this.quantity * this.service.price;
      this.days.map( day => {
        this.daysArray.push(
          this.formBuilder.group({
            index: new FormControl(this.daysArray.controls.length),
            day: new FormControl(day),
            selected: new FormControl(false),
            type: 2
          })
        )
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
  
  validateDate(control: AbstractControl) {
    console.log('control', control);
    var exist = false;
    if(this.daysArray.length > 0) {
      this.daysArray.controls.map( o => {
        if(o.value.date != null) {

          if(o.value.date.year === control.value.year &&
            o.value.date.month === control.value.month && 
            o.value.date.day === control.value.day
            ) {
            exist = true;
            console.log('existe');
          }
        }
      });

    }
    return exist ? { 'repeatedDate': true } : null;
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

  getWorkingDays(serviceType: string) {
    this.loaderService.loading(true);
    this.workingdayService.findByServiceType(serviceType).subscribe( resp => {
      resp.data.filter( (workingDay: any) => workingDay.status === 1 ).map( (workingDay: any) => {
        this.workingDays.push({ value: workingDay.id, label: workingDay.name } );
        this.workingDays = this.serviceTypes.slice();
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

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  loadData() {
    if(this.customer) {
      this.reserveService.getByCustomer(this.customer.id).subscribe(resp => {
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
          className: 'btn-sm boton-excel wid-7',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/añadir.png">',
          titleAttr: 'Nuevo Cliente',
          action(e: any) {
            that.cancel();
            that.openModal.nativeElement.click();
          }
        },
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
        },
      ],
      columnDefs: [
        { targets: 0, searchable: false, visible: false, className: 'notexport' },
        { targets: 4,  className: 'text-center' },
        { targets: 5,  className: 'wid-15 text-center' }
      ],
      order: [],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

  open(modal: any) {
    this.modalService.open(modal, { size: 'lg'});
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  cancel() {
    /*this.id = null;
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]);
    this.form.reset({status: true});
    this.submitted = false;
    this.customer = new UserModel();
    this.form.controls.status.disable();
    while (this.addressesArray.length !== 0) {
      this.addressesArray.removeAt(0)
    }
    this.cancelAddress();
    if(!this.canCreate) {
      this.form.disable();
    }*/
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
        Swal.close();
        if(Object.keys(resp).length === 0) {
          this.customer = null;
          this.addresses = [];
          const toastOptions: ToastOptions = {
            title: 'Error',
            msg: 'Cliente no encontrado',
            showClose: false,
            timeout: 5000,
            theme: 'bootstrap',
          };
          this.toastyService.error(toastOptions);
        } else {
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

  getPermissions() {
    const that = this;
    this.userService.permissions().subscribe( resp => {
      const create = resp.filter( (permission: any) => permission.name === 'CREAR_RESERVAS');
      if(create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter( (permission: any) => permission.name === 'VER_RESERVAS');
      if(see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter( (permission: any) => permission.name === 'MODIFICAR_RESERVAS');
      if(edit.length >= 1) {
        that.canEdit = true;
      }
      const eliminar = resp.filter( (permission: any) => permission.name === 'ELIMINAR_RESERVAS');
      if(eliminar.length >= 1) {
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

}
