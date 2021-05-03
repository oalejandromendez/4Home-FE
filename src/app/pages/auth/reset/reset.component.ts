import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/services/common/loader/loader.service';

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
    private loaderService: LoaderService
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
    this.submitted = true;
    /*if (!this.form.valid) { return; }
    this.loaderService.loading(true);
    this.authUser = this.form.value;
    this.authService.login( this.authUser ).subscribe( resp => {
      this.router.navigate(['/dashboard']);
    }, (err) => {
      this.loaderService.loading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Los credenciales de acceso son incorrectas'
      });
    });*/
  }

}
