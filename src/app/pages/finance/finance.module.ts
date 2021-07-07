import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceRoutingModule } from './finance-routing.module';
import { PromocodeComponent } from './promocode/promocode.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDatepickerModule, NgbTabsetModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ResponseComponent } from './response/response.component';


@NgModule({
  declarations: [PromocodeComponent, ResponseComponent],
  imports: [
    CommonModule,
    FinanceRoutingModule,
    SharedModule,
    NgbTooltipModule,
    NgbDatepickerModule,
    NgbTabsetModule
  ]
})
export class FinanceModule { }
