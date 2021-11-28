import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDatepickerModule, NgbTabsetModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ExpirationComponent } from './expiration/expiration.component';
import { HistoryReportComponent } from './history-report/history-report.component';
import { PendingReportComponent } from './pending-report/pending-report.component';
import { ProfessionalReportComponent } from './professional-report/professional-report.component';
import { PaymentReportComponent } from './payment-report/payment-report.component';
import { ServiceReportComponent } from './service-report/service-report.component';
import { ActivityComponent } from './activity/activity.component';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import { ScheduleProfessionalsReportComponent } from './schedule-professionals-report/schedule-professionals-report.component';


@NgModule({
  declarations: [ScheduleReportComponent, ExpirationComponent, HistoryReportComponent, PendingReportComponent, ProfessionalReportComponent, PaymentReportComponent, ServiceReportComponent, ActivityComponent, ScheduleProfessionalsReportComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedModule,
    NgbTooltipModule,
    NgbDatepickerModule,
    NgbTabsetModule,
    NgMultiSelectDropDownModule
  ]
})
export class ReportModule { }
