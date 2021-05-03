import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { map } from 'rxjs/operators';
import { UserModel } from 'src/app/models/admin/user.model';
import { AuthModel } from 'src/app/models/auth/auth.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DocumentTypeService } from 'src/app/services/common/documenttype/documenttype.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { SignupService } from 'src/app/services/scheduling/signup/signup.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  customer: UserModel = new UserModel();

  submitted = false;
  form: FormGroup;

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
  authUser: AuthModel;

  get addressesArray() {
    return this.form.get('addresses') as FormArray;
  }

  constructor(
    private loaderService: LoaderService,
    private documentTypeService: DocumentTypeService,
    private formBuilder: FormBuilder,
    private singupService: SignupService,
    private toastyService: ToastyService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loaderService.loading(true);
    this.loadForm();
  }

  ngOnInit(): void {
    this.authUser = new AuthModel();
    this.getDocumentsType();
    this.getCustomerTypes();
  }

  loadForm() {
    this.form = new FormGroup({
      type_document: new FormControl(null, [Validators.required]),
      identification: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.pattern('^[0-9]*$')],this.validateIdentification.bind(this)),
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
    return this.singupService.validateIdentification(control.value).pipe(map( (resp: any) => {
      return Object.keys(resp).length > 0 ? { identification: true } : null ;
    }));
  }

  validateEmail(control: AbstractControl) {
    return this.singupService.validateEmail(control.value).pipe(map( (resp: any) => {
      return Object.keys(resp).length > 0 ? { email: true } : null ;
    }));
  }

  getDocumentsType() {
    this.loaderService.loading(true);
    this.documentTypeService.getWithoutAuthentication().subscribe( (resp: any) => {
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
    this.singupService.customerType().subscribe( (resp: any) => {
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

    const that = this;

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

    this.singupService.post( this.customer ).subscribe( (data: any) => {

      that.authUser.email = that.customer.email;
      that.authUser.password = that.customer.password;

      that.authService.login( that.authUser ).subscribe( resp => {
        Swal.close();
        that.router.navigate(['/dashboard']);
      }, (err) => {
        that.loaderService.loading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:  'Ha ocurrido un error'
        });
      });

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
      }
    });
  }
}
