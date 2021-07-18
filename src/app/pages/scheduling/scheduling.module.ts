import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulingRoutingModule } from './scheduling-routing.module';
import { CustomertypeComponent } from './customertype/customertype.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDatepickerModule, NgbTabsetModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomerComponent } from './customer/customer.component';
import { ReserveComponent } from './reserve/reserve.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { RescheduleComponent } from './reschedule/reschedule.component';
import { HistoryComponent } from './history/history.component';

@NgModule({
  declarations: [CustomertypeComponent, CustomerComponent, ReserveComponent, ScheduleComponent, RescheduleComponent, HistoryComponent],
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
