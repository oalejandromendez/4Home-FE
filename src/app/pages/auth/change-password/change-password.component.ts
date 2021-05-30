import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastyService } from 'ng2-toasty';
import { UserService } from 'src/app/services/admin/user/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  submitted = false;
  form: FormGroup;

  // ----------Pattern-----------
  passwordPattern: any = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  showpassword = false;
  showconfirmation = false;
  user = null;

  constructor(
    private loaderService: LoaderService,
    private toastyService: ToastyService,
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loadForm();
  }

  ngOnInit(): void {
    this.loaderService.loading(false);
    this.user = this.authService.authUser();
  }

  loadForm() {
    this.form = new FormGroup({
      password: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]),
      password_confirmation: new FormControl('', [Validators.required]),
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

  onSubmit() {

    const that = this;

    this.submitted = true;

    if (!this.form.valid && this.user) { return; }

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text:  'Espere...'
    });

    Swal.showLoading();

    const user = this.form.value;
    user.id = this.user.id

    this.userService.changePassword( user ).subscribe( (data: any) => {
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
  }
}
