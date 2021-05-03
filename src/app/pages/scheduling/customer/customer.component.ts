import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserModel } from 'src/app/models/admin/user.model';
import { DataTableLanguage } from 'src/app/models/common/datatable';
import { UserService } from 'src/app/services/admin/user/user.service';
import { DocumentTypeService } from 'src/app/services/common/documenttype/documenttype.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { CustomerService } from 'src/app/services/scheduling/customer/customer.service';
import { CustomertypeService } from 'src/app/services/scheduling/customertype/customertype.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerComponent implements OnInit, OnDestroy  {

  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {};
  private subscription: Subscription;

  customers: any[];
  customer: UserModel = new UserModel();

  submitted = false;
  form: FormGroup;

  id: any;

  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;

  documentTypes: Array<any> = new Array();
  customerTypes: Array<any> = new Array();

  // ----------Pattern-----------
  emailPattern: any = /^[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})/;
  passwordPattern: any = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  showpassword = false;
  showconfirmation = false;

  addAddress = false;
  editAddress = false;
  address: null;
  oldAddress = null;

  get addressesArray() {
    return this.form.get('addresses') as FormArray;
  }

  constructor(
    private language: DataTableLanguage,
    private router: Router,
    private toastyService: ToastyService,
    private userService: UserService,
    private customerService: CustomerService,
    private loaderService: LoaderService,
    private modalService: NgbModal,
    private documentTypeService: DocumentTypeService,
    private customertypeService: CustomertypeService,
    private formBuilder: FormBuilder
  ) {
    this.loaderService.loading(true);
    this.loadForm();
    this.getPermissions();
  }

  ngOnInit(): void {
    this.loadTable();
    this.getDocumentsType();
    this.getCustomerTypes();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  loadForm() {
    this.form = new FormGroup({
      type_document: new FormControl(null, [Validators.required]),
      identification: new FormControl('', [Validators.required, Validators.maxLength(20)],this.validateIdentification.bind(this)),
      name: new FormControl('', [Validators.required, Validators.maxLength(50)],),
      lastname: new FormControl('', [Validators.required, Validators.max(50)]),
      email: new FormControl('', [Validators.required, Validators.max(50), Validators.pattern(this.emailPattern)], this.validateEmail.bind(this)),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      password: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]),
      password_confirmation: new FormControl('', [Validators.required]),
      status: new FormControl({value: true, disabled: true}, [Validators.required]),
      contact_name: new FormControl('', [Validators.required, Validators.maxLength(250)]),
      billing_address: new FormControl('', [Validators.required, Validators.maxLength(250)]),
      customer_type: new FormControl(null, [Validators.required]),
      addresses: this.formBuilder.array([], {validators: this.minAddresses })
    }, { validators: this.matchingPasswords('password', 'password_confirmation') });
  }

  matchingPasswords(password: string, passwordconfirmation: string) {
    return (group: FormGroup): { [key: string]: any } => {
      const passwordT = group.controls[password];
      const confirmPassword = group.controls[passwordconfirmation];
      if (passwordT.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    };
  }

  minAddresses: ValidatorFn = (form: FormArray) => {
    return form.controls.length >= 1 ? null : { required: true};
  }

  validateIdentification(control: AbstractControl) {
    return this.customerService.validateIdentification(control.value).pipe(map( (resp: any) => {
      if (this.id) {
        if (resp.identification === this.customer.identification) {
          return null;
        }
      }
      return Object.keys(resp).length > 0 ? { identification: true } : null ;
    }));
  }

  validateEmail(control: AbstractControl) {
    return this.userService.validateEmail(control.value).pipe(map( (resp: any) => {
      if (this.id) {
        if (resp.email === this.customer.email) {
          return null;
        }
      }
      return Object.keys(resp).length > 0 ? { email: true } : null ;
    }));
  }

  getDocumentsType() {
    this.loaderService.loading(false);
    this.documentTypeService.get().subscribe( (resp: any) => {
      resp.map( (type: any) => {
        this.documentTypes.push({ value: String(type.id), label: type.name } );
        this.documentTypes = this.documentTypes.slice();
      });
      this.loaderService.loading(true);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Ha ocurrido un error'
      });
    });
  }

  getCustomerTypes() {
    this.loaderService.loading(false);
    this.customertypeService.get().subscribe( (resp: any) => {
      resp.data.map( (type: any) => {
        this.customerTypes.push({ value: String(type.id), label: type.name } );
        this.customerTypes = this.customerTypes.slice();
      });
      this.loaderService.loading(true);
    }, error => {
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
    this.customerService.get().subscribe(resp => {
      this.customers = resp;
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
          titleAttr: 'Nuevo Cliente',
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
        { targets: 0, searchable: false, visible: false, className: 'notexport' },
        { targets: 4,  className: 'text-center' },
        { targets: 5,  className: 'wid-15 text-center' }
      ],
      order: [],
      language: that.language.getLanguage('es'),
      responsive: true
    };
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

    this.customer = this.form.value;
    this.customer.roles = ['2'];

    const listAddresses = new Array();

    this.addressesArray.value.map( (address: any) => {
      listAddresses.push(address.address);
    });

    this.customer.addresses = listAddresses;

    if (this.id) {

      this.customerService.put( this.customer , this.id).subscribe( (data: any)  => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El cliente se ha editado exitosamente',
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

    } else {

      this.customerService.post( this.customer).subscribe( (data: any) => {
        Swal.close();
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El cliente se ha registrado exitosamente',
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

  edit(id: any) {
    if(id) {
      this.id = id;
      const data = this.customers.find( customer => customer.id === id);
      this.customer = data;
      if (data) {
        this.form.controls.password.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]);
        this.form.patchValue(data);
        this.form.controls.type_document.setValue(String(data.type_document));
        this.form.controls.customer_type.setValue(String(data.customer_type));
        this.loadAddressesCustomer(data);
        this.form.controls.status.enable();
        this.form.enable();
        this.openModal.nativeElement.click();
      }
    }
  }

  loadAddressesCustomer(data: any) {
    if(data.customer_address.length > 0) {
      data.customer_address.map( (address: any) => {
        this.addressesArray.push(
          this.formBuilder.group({
            index: new FormControl(this.addressesArray.controls.length),
            address: new FormControl(address.address)
          })
        )
      });
    }
  }

  cancel() {
    this.id = null;
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
    }
  }

  delete(id: any, index: any) {
    if (id) {
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
            this.customerService.delete(id).subscribe( data => {
              this.customers.splice(index, 1);
              this.dtOptions = {};
              this.loadTable();
              this.rerender();
              this.cancel();
              Swal.fire('Proceso Exitoso!', 'Se ha eliminado el cliente exitosamente', 'success' );
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
    this.modalService.open(modal, { size: 'lg', windowClass: 'customer-modal' });
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  newAddress() {
    this.address = null;
    this.addAddress = true;
  }

  saveAddress() {
    if(!this.address) return false;
    this.addressesArray.push(
      this.formBuilder.group({
        index: new FormControl(this.addressesArray.controls.length),
        address: new FormControl(this.address),
      })
    )
    this.cancelAddress();
  }

  getAddress(address: any) {
    if(address) {
      this.address = null;
      this.addAddress = false;
      this.oldAddress = address;
      this.address = address.value.address;
      this.editAddress = true;
    }
  }

  updateAddress() {
    if(this.oldAddress) {
      this.oldAddress.controls.address.setValue(this.address);
      this.cancelAddress();
    }
  }

  removeAddress() {
    if(this.oldAddress) {
      this.addressesArray.removeAt( this.addressesArray.value.findIndex( address => address.index === this.oldAddress.value.index ));
      this.cancelAddress();
    }
  }

  cancelAddress() {
    this.address = null;
    this.addAddress = false;
    this.editAddress = false;
    this.oldAddress = null;
  }

  getPermissions() {
    const that = this;
    this.userService.permissions().subscribe( resp => {
      const create = resp.filter( (permission: any) => permission.name === 'CREAR_CLIENTES');
      if(create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter( (permission: any) => permission.name === 'VER_CLIENTES');
      if(see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter( (permission: any) => permission.name === 'MODIFICAR_CLIENTES');
      if(edit.length >= 1) {
        that.canEdit = true;
      }
      const eliminar = resp.filter( (permission: any) => permission.name === 'ELIMINAR_CLIENTES');
      if(eliminar.length >= 1) {
        that.canDelete = true;
      }
      if(!that.canCreate) {
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
      this.loaderService.loading(false);
    });
  }
}
