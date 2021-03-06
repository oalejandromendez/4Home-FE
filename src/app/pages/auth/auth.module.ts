import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ResetComponent } from './reset/reset.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordComponent } from './change-password/change-password.component';

@NgModule({
  declarations: [LoginComponent, ResetComponent, SignUpComponent, ChangePasswordComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    NgbTooltipModule
  ]
})
export class AuthModule { }
