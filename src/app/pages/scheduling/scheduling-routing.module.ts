import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerComponent } from './customer/customer.component';
import { CustomertypeComponent } from './customertype/customertype.component';
import { ReserveComponent } from './reserve/reserve.component';
import { ScheduleComponent } from './schedule/schedule.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'customertype',
        component: CustomertypeComponent,
      },
      {
        path: 'customer',
        component: CustomerComponent,
      },
      {
        path: 'reserve',
        component: ReserveComponent,
      },
      {
        path: 'schedule',
        component: ScheduleComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulingRoutingModule { }
