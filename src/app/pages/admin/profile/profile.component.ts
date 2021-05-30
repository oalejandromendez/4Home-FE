import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { map } from 'rxjs/operators';
import { UserModel } from 'src/app/models/admin/user.model';
import { UserService } from 'src/app/services/admin/user/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DocumentTypeService } from 'src/app/services/common/documenttype/documenttype.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { CustomerService } from 'src/app/services/scheduling/customer/customer.service';
import { CustomertypeService } from 'src/app/services/scheduling/customertype/customertype.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user = null;

  submitted = false;
  form: FormGroup;

  documentTypes: Array<any> = new Array();
  customerTypes: Array<any> = new Array();

  userModel: UserModel = new UserModel();

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

  id: any;
  isCustomer = null;
  isUser = false;

  constructor(
    private loaderService: LoaderService,
    private authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private documentTypeService: DocumentTypeService,
    private customertypeService: CustomertypeService,
    private toastyService: ToastyService,
    private router: Router
  ) {
    this.getDocumentsType();
    this.getCustomerTypes();
  }

  ngOnInit(): void {
    this.loaderService.loading(true);
    this.user = this.authService.authUser();
    this.validateUser();
  }

  validateUser() {
    this.userService.getById(this.user.id).subscribe( resp => {
      this.user = resp;
      this.id = this.user.id;
      sessionStorage.setItem('user', JSON.stringify(resp));
      this.isCustomer = resp.roles.find( (rol: any) => rol.name === 'CLIENTE');
      if(this.isCustomer ) {
        this.loadCustomerProfile();
      } else {
        this.isUser = true;
        this.loadUserProfile();
      }
      this.loaderService.loading(false);
    }, (err) => {
      this.loaderService.loading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Ha ocurrido un erro'
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

  getCustomerTypes() {
    this.loaderService.loading(true);
    this.customertypeService.get().subscribe( (resp: any) => {
      resp.data.map( (type: any) => {
        this.customerTypes.push({ value: String(type.id), label: type.name } );
        this.customerTypes = this.customerTypes.slice();
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

  loadUserProfile() {
    this.form = new FormGroup({
      name: new FormControl(this.user.name, [Validators.required, Validators.maxLength(50)],),
      lastname: new FormControl(this.user.lastname, [Validators.required, Validators.max(50)]),
      age: new FormControl(this.user.age, [Validators.required, Validators.pattern('^[0-9]*$')]),
      email: new FormControl(this.user.email, [Validators.required, Validators.max(50), Validators.pattern(this.emailPattern)], this.validateEmail.bind(this)),
      address: new FormControl(this.user.address, [Validators.required, Validators.max(120)]),
      phone: new FormControl(this.user.phone, [Validators.required, Validators.pattern('^[0-9]*$')]),
      password: new FormControl('', [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]),
      password_confirmation: new FormControl(''),
      status: new FormControl(true, [Validators.required]),
    }, { validators: this.matchingPasswords('password', 'password_confirmation') });
  }

  loadCustomerProfile() {
    this.form = new FormGroup({
      type_document: new FormControl(String(this.user.type_document), [Validators.required]),
      identification: new FormControl(this.user.identification, [Validators.required, Validators.maxLength(20)],this.validateIdentification.bind(this)),
      name: new FormControl(this.user.name, [Validators.required, Validators.maxLength(50)],),
      lastname: new FormControl(this.user.lastname, [Validators.required, Validators.max(50)]),
      email: new FormControl(this.user.email, [Validators.required, Validators.max(50), Validators.pattern(this.emailPattern)], this.validateEmail.bind(this)),
      phone: new FormControl(this.user.phone, [Validators.required, Validators.pattern('^[0-9]*$')]),
      mobile: new FormControl(this.user.mobile, [Validators.required, Validators.pattern('^[0-9]*$')]),
      password: new FormControl('', [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]),
      password_confirmation: new FormControl(''),
      status: new FormControl(true, [Validators.required]),
      contact_name: new FormControl(this.user.contact_name, [Validators.required, Validators.maxLength(250)]),
      billing_address: new FormControl(this.user.billing_address, [Validators.required, Validators.maxLength(250)]),
      customer_type: new FormControl(String(this.user.customer_type), [Validators.required]),
      addresses: this.formBuilder.array([], {validators: this.minAddresses })
    }, { validators: this.matchingPasswords('password', 'password_confirmation') });

    this.loadAddressesCustomer();
  }

  loadAddressesCustomer() {
    if(this.user.customer_address.length > 0) {
      this.user.customer_address.map( (address: any) => {
        this.addressesArray.push(
          this.formBuilder.group({
            index: new FormControl(this.addressesArray.controls.length),
            address: new FormControl(address.address)
          })
        )
      });
    }
  }

  matchingPasswords(password: string, passwordconfirmation: string) {
    return (group: FormGroup): { [key: string]: any } => {
      const passwordT = group.controls[password];
      const confirmPassword = group.controls[passwordconfirmation];
      if(this.id) {
        return null;
      }
      else if (passwordT.value !== confirmPassword.value) {
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
        if (resp.identification === this.user.identification) {
          return null;
        }
      }
      return Object.keys(resp).length > 0 ? { identification: true } : null ;
    }));
  }

  validateEmail(control: AbstractControl) {
    return this.userService.validateEmail(control.value).pipe(map( (resp: any) => {
      if (this.id) {
        if (resp.email === this.user.email) {
          return null;
        }
      }
      return Object.keys(resp).length > 0 ? { email: true } : null ;
    }));
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

  onSubmit() {

    this.submitted = true;

    if (!this.form.valid) { return; }

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text:  'Espere...'
    });

    Swal.showLoading();

    this.userModel = this.form.value;

    if(this.isCustomer) {
      this.userModel.roles = ['2'];

      const listAddresses = new Array();

      this.addressesArray.value.map( (address: any) => {
        listAddresses.push(address.address);
      });

      this.userModel.addresses = listAddresses;

      this.customerService.put( this.userModel , this.id).subscribe( (data: any)  => {
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El perfil se ha editado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        Swal.close();
        this.validateUser();

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

    if(this.isUser) {

      const user = this.form.value;
      user.roles = this.user.roles.map( (rol: any) => rol.id);

      this.userService.put( user, this.id).subscribe( (data: any)  => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El perfil se ha editado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        Swal.close();
        this.validateUser();

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
}
