import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthModel } from 'src/app/models/auth/auth.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  /*Formulario*/
  form: FormGroup;
  submitted = false;
  // ----------Pattern-----------
  emailPattern: any = /^[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})/;
  passwordPattern: any = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  showpassword = false;
  loader = false;
  authUser: AuthModel;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private authService: AuthService
  ) {
    this.loadForm();
  }

  ngOnInit(): void {
    this.authUser = new AuthModel();
    this.loaderService.loading(false);
  }

  loadForm() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(70), Validators.pattern(this.emailPattern)]),
      password: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]),
    });
  }

  onSubmit() {
    this.submitted = true;
    if (!this.form.valid) { return; }
    this.loaderService.loading(true);
    this.authUser = this.form.value;
    this.authService.login( this.authUser ).subscribe( resp => {
      if(resp.user.reset_password === 1) {
        this.router.navigate(['/auth/changepassword']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }, (err) => {
      this.loaderService.loading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Los credenciales de acceso son incorrectas'
      });
    });
  }
}
