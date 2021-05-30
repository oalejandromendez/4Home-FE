import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { SignupService } from 'src/app/services/scheduling/signup/signup.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {

   /*Formulario*/
   form: FormGroup;
   submitted = false;
   // ----------Pattern-----------
   emailPattern: any = /^[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})/;

  constructor(
    private loaderService: LoaderService,
    private singupService: SignupService,
    private toastyService: ToastyService
  ) {
    this.loadForm();
  }

  ngOnInit(): void {
    this.loaderService.loading(false);
  }

  loadForm() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(70), Validators.pattern(this.emailPattern)]),
    });
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

    this.singupService.resetPassword( this.form.value ).subscribe( (data: any) => {

      Swal.close();
      const toastOptions: ToastOptions = {
        title: '¡Proceso Exitoso!',
        msg: 'Se ha enviado un correo electronico para restablecer la contraseña!',
        showClose: false,
        timeout: 3000,
        theme: 'bootstrap',
      };
      this.toastyService.success(toastOptions);

    }, (err) => {
      Swal.close();
      if(err.status === 404) {
        const toastOptions: ToastOptions = {
          title: 'Error',
          msg: 'El correo suministrado no se encuentra registrado en nuestro sistema',
          showClose: false,
          timeout: 4000,
          theme: 'bootstrap',
        };
        this.toastyService.error(toastOptions);
      }
      if(err.status === 500) {
        const toastOptions: ToastOptions = {
          title: 'Error',
          msg: 'Ha ocurrido un error',
          showClose: false,
          timeout: 4000,
          theme: 'bootstrap',
        };
        this.toastyService.error(toastOptions);
      }
    });

  }

}
