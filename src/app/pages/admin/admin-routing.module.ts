import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HolidayComponent } from './holiday/holiday.component';
import { PositionComponent } from './position/position.component';
import { ProfessionalComponent } from './professional/professional.component';
import { RolesComponent } from './roles/roles.component';
import { ServiceComponent } from './service/service.component';
import { ServicetypeComponent } from './servicetype/servicetype.component';
import { UsersComponent } from './users/users.component';
import { WorkingdayComponent } from './workingday/workingday.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'roles',
        component: RolesComponent,
      },
      {
        path: 'professional',
        component: ProfessionalComponent,
      },
      {
        path: 'position',
        component: PositionComponent,
      },
      {
        path: 'workingday',
        component: WorkingdayComponent,
      },
      {
        path: 'service',
        component: ServiceComponent,
      },
      {
        path: 'holiday',
        component: HolidayComponent,
      },
      {
        path: 'servicetype',
        component: ServicetypeComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
