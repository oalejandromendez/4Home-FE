import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulingRoutingModule } from './scheduling-routing.module';
import { CustomertypeComponent } from './customertype/customertype.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDatepickerModule, NgbTabsetModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomerComponent } from './customer/customer.component';
import { ReserveComponent } from './reserve/reserve.component';
import { ScheduleComponent } from './schedule/schedule.component';

@NgModule({
  declarations: [CustomertypeComponent, CustomerComponent, ReserveComponent, ScheduleComponent],
  imports: [
    CommonModule,
    SchedulingRoutingModule,
    SharedModule,
    NgbTooltipModule,
    NgbDatepickerModule,
    NgbTabsetModule
  ]
})
export class SchedulingModule { }
