import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDatepickerModule, NgbTimepickerModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfessionalComponent } from './professional/professional.component';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { PositionComponent } from './position/position.component';
import { WorkingdayComponent } from './workingday/workingday.component';
import { ServiceComponent } from './service/service.component';
import { HolidayComponent } from './holiday/holiday.component';
import { ServicetypeComponent } from './servicetype/servicetype.component';
import { AvailabilityComponent } from './availability/availability.component';
import { StatusComponent } from './status/status.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [UsersComponent, RolesComponent, ProfessionalComponent, PositionComponent, WorkingdayComponent, ServiceComponent, HolidayComponent, ServicetypeComponent, AvailabilityComponent, StatusComponent, ProfileComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    NgbTooltipModule,
    NgbDatepickerModule,
    CurrencyMaskModule,
    NgbTimepickerModule
  ]
})
export class AdminModule { }
