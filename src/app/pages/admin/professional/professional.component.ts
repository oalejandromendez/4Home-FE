import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbCalendar, NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableDirective} from 'angular-datatables';
import {ToastOptions, ToastyConfig, ToastyService} from 'ng2-toasty';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {ProfessionalModel} from 'src/app/models/admin/professional.model';
import {DataTableLanguage} from 'src/app/models/common/datatable';
import {ProfessionalService} from 'src/app/services/admin/professional/professional.service';
import {UserService} from 'src/app/services/admin/user/user.service';
import {CustomDatepickerI18n, I18n} from 'src/app/services/common/datepicker/datepicker.service';
import {LoaderService} from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import {DocumentTypeService} from 'src/app/services/common/documenttype/documenttype.service';
import {PositionService} from 'src/app/services/admin/position/position.service';
import {StatusService} from 'src/app/services/admin/status/status.service';
import {labels} from '@lang/labels/es_es';
import {texts} from '@lang/texts/es_es';
import {messages} from '@lang/messages/es_es';

@Component({
  selector: 'app-professional',
  templateUrl: './professional.component.html',
  styleUrls: ['./professional.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}, NgbDatepickerConfig]
})
export class ProfessionalComponent implements OnInit, OnDestroy {

  labels = labels;
  texts = texts;
  messages = messages;

  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  dtOptions: any = {};
  professionals: any[];
  professional: ProfessionalModel = new ProfessionalModel();
  submitted = false;
  form: FormGroup;
  id: any;
  permissions: Array<any> = [];
  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;

  emailPattern: any = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;

  imageError: string;
  isImageSaved: boolean;
  cardImageBase64 = null;
  documentTypes: Array<any> = [];
  positions: Array<any> = [];
  statuses: Array<any> = [];
  today = this.calendar.getToday();
  now: Date = new Date();
  optionsTemplate: any;

  constructor(
    private router: Router,
    private toastyService: ToastyService,
    private professionalService: ProfessionalService,
    private loaderService: LoaderService,
    private userService: UserService,
    private language: DataTableLanguage,
    private modalService: NgbModal,
    private toastyConfig: ToastyConfig,
    private documentTypeService: DocumentTypeService,
    private positionService: PositionService,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private I18n: I18n,
    private statusService: StatusService
  ) {
    this.loaderService.loading(true);
    this.loadForm();
    this.getPermissions();
    this.toastyConfig.theme = 'material';

    this.optionsTemplate = {
      decimal: '',
      precision: 0,
      prefix: '$',
      thousands: '.',
    };
    config.minDate = {year: 2000, month: 1, day: 1};
    config.maxDate = {year: this.now.getFullYear(), month: this.now.getMonth() + 1 , day: this.now.getDate()};
    this.I18n.language = 'es';
  }

  ngOnInit(): void {
    this.loadTable();
    this.getDocumentsType();
    this.getPositions();
    this.getStatuses();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  getDocumentsType() {
    this.loaderService.loading(true);
    this.documentTypeService.get().subscribe((resp: any) => {
      resp.map((type: any) => {
        this.documentTypes.push({value: String(type.id), label: type.name});
        this.documentTypes = this.documentTypes.slice();
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

  getStatuses() {
    this.loaderService.loading(true);
    this.statusService.get().subscribe((resp: any) => {
      resp.filter((status: any) => status.status === 1).map((status: any) => {
        this.statuses.push({value: String(status.id), label: status.name});
        this.statuses = this.statuses.slice();
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

  getPositions() {
    this.loaderService.loading(true);
    this.positionService.get().subscribe((resp: any) => {
      resp.filter((position: any) => position.status === 1).map((position: any) => {
        this.positions.push({value: String(position.id), label: position.name});
        this.positions = this.positions.slice();
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

  loadForm() {
    this.form = new FormGroup({
      type_document: new FormControl(null, [Validators.required]),
      identification: new FormControl('', [Validators.required, Validators.maxLength(20)], this.validateIdentification.bind(this)),
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      lastname: new FormControl('', [Validators.required, Validators.max(50)]),
      age: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      email: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(this.emailPattern)], this.validateEmail.bind(this)),
      address: new FormControl('', [Validators.required, Validators.maxLength(120)]),
      position: new FormControl(null, [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      phone_contact: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      salary: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      photo: new FormControl(''),
      status: new FormControl(null, [Validators.required]),
      admission_date: new FormControl('', [Validators.required]),
      retirement_date: new FormControl('')
    }, {validators: this.ValidateDates});
  }

  validateIdentification(control: AbstractControl) {
    return this.professionalService.validateIdentification(control.value).pipe(map((resp: any) => {
      if (this.id) {
        if (resp.identification === this.professional.identification) {
          return null;
        }
      }
      return Object.keys(resp).length > 0 ? {identification: true} : null;
    }));
  }

  validateEmail(control: AbstractControl) {
    return this.professionalService.validateEmail(control.value).pipe(map((resp: any) => {
      if (this.id) {
        if (resp.email === this.professional.email) {
          return null;
        }
      }
      return Object.keys(resp).length > 0 ? {email: true} : null;
    }));
  }

  ValidateDates: ValidatorFn = (formG: FormGroup) => {
    let startDate = formG.get('admission_date').value;
    let endDate = formG.get('retirement_date').value;
    const now = new Date();
    let dateLimit: string;
    if (startDate && endDate) {
      startDate = startDate.year + '-' + (startDate.month < 10 ? '0' + startDate.month : startDate.month ) + '-' +
                                         (startDate.day < 10 ? '0' + startDate.day : startDate.day) ;
      endDate = endDate.year + '-' + (endDate.month < 10 ? '0' + endDate.month : endDate.month)  + '-' +
                                     (endDate.day < 10 ? '0' + endDate.day : endDate.day);

      dateLimit = now.getFullYear() + '-' + ( (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1) ) + '-' +
                                      (now.getDate() + 1  < 10 ? '0' + now.getDate() + 1 : now.getDate() + 1);
    }
    return startDate !== null && endDate != null ? startDate <= endDate ? startDate >= dateLimit ? {errorStartDate: true} : endDate >= dateLimit ? {errorEndDate: true} : null : {dates: true} : null;
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  loadData() {
    this.professionalService.get().subscribe(resp => {
      this.professionals = resp.data;
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
          titleAttr: 'Nuevo Profesional',
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
        {targets: 4, className: 'text-center'},
        {targets: 5, className: 'wid-15 text-center'}
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

    this.professional = this.form.value;
    this.professional.photo = this.cardImageBase64;

    const startDate = this.form.get('admission_date').value;
    const endDate = this.form.get('retirement_date').value;

    this.professional.admission_date = startDate.year + '-' + startDate.month + '-' + startDate.day;

    endDate != null ? this.professional.retirement_date = endDate.year + '-' + endDate.month + '-' + endDate.day : '';

    if (this.id) {

      this.professionalService.put(this.professional, this.id).subscribe((data: any) => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El profesional se ha editado exitosamente',
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
          if (err.status === 505) {
            const toastOptions: ToastOptions = {
              title: 'Error',
              msg: 'No se puede modificar el estado del usuario porque tiene reservas abiertas',
              showClose: false,
              timeout: 2000,
              theme: 'bootstrap',
            };
            this.toastyService.error(toastOptions);
          }
          if (err.status === 401) {
            this.router.navigateByUrl('/auth/login');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: messages.service_error
            });
          }
        }
      });

    } else {

      this.professionalService.post(this.professional).subscribe((data: any) => {
        Swal.close();
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El profesional se ha registrado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.form.reset();
        this.submitted = false;
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
  }

  edit(id: any) {
    if (id) {
      this.id = id;
      const data = this.professionals.find((professional: any) => professional.id === id);
      this.professional = data;
      if (data) {
        this.form.patchValue(data);
        this.form.controls.type_document.setValue(String(data.type_document));
        this.cardImageBase64 = data.photo;
        this.form.controls.position.setValue(String(data.position.id));
        this.form.controls.status.setValue(String(data.status.id));
        let admission_date = null;
        if(data.admission_date) {
          admission_date = data.admission_date.split('-');
          this.form.controls.admission_date.setValue({ year: +admission_date[0], month: +admission_date[1], day: +admission_date[2]});
        }
        let retirement_date = null;
        if (data.retirement_date) {
          retirement_date = data.retirement_date.split('-');
          this.form.controls.retirement_date.setValue({ year: +retirement_date[0], month: +retirement_date[1], day: +retirement_date[2]});
        }
        this.form.enable();
        this.openModal.nativeElement.click();
      }
    }
  }

  cancel() {
    this.id = null;
    this.submitted = false;
    this.professional = new ProfessionalModel();
    this.form.reset();
    this.cardImageBase64 = null;
    if (!this.canCreate) {
      this.form.disable();
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
            this.professionalService.delete(id).subscribe(data => {
              this.professionals.splice(index, 1);
              this.dtOptions = {};
              this.loadTable();
              this.rerender();
              this.cancel();
              Swal.fire('Proceso Exitoso!', 'Se ha eliminado el profesional exitosamente', 'success');
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
    this.modalService.open(modal, {windowClass: 'modal-professional'});
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  getPermissions() {
    const that = this;
    this.userService.permissions().subscribe(resp => {
      const create = resp.filter((permission: any) => permission.name === 'CREAR_PROFESIONALES');
      if (create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter((permission: any) => permission.name === 'VER_PROFESIONALES');
      if (see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter((permission: any) => permission.name === 'MODIFICAR_PROFESIONALES');
      if (edit.length >= 1) {
        that.canEdit = true;
      }
      const eliminar = resp.filter((permission: any) => permission.name === 'ELIMINAR_PROFESIONALES');
      if (eliminar.length >= 1) {
        that.canDelete = true;
      }
      if (!that.canCreate) {
        this.form.disable();
      }
      this.loadData();
    }, () => {
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

  onFileSelected(fileInput: any) {
    this.imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      const max_size = 20971520;
      const allowed_types = ['image/png', 'image/jpeg'];
      const max_height = 15200;
      const max_width = 25600;
      if (fileInput.target.files[0].size > max_size) {
        this.imageError = 'Maximum size allowed is ' + max_size / 1000 + 'Mb';
        return false;
      }
      if (!_.includes(allowed_types, fileInput.target.files[0].type)) {
        this.imageError = 'Only Images are allowed ( JPG | PNG )';
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const target = rs.currentTarget as any;
          const imgHeight = target.height;
          const imgWidth = target.width;
          if (imgHeight > max_height && imgWidth > max_width) {
            this.imageError =
              'Maximum dimentions allowed ' +
              max_height +
              '*' +
              max_width +
              'px';
            return false;
          } else {
            const imgBase64Path = e.target.result;
            this.cardImageBase64 = imgBase64Path;
            this.isImageSaved = true;
          }
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
}
