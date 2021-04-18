import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulingRoutingModule } from './scheduling-routing.module';
import { CustomertypeComponent } from './customertype/customertype.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDatepickerModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomerComponent } from './customer/customer.component';


@NgModule({
  declarations: [CustomertypeComponent, CustomerComponent],
  imports: [
    CommonModule,
    SchedulingRoutingModule,
    SharedModule,
    NgbTooltipModule,
    NgbDatepickerModule,
  ]
})
export class SchedulingModule { }
