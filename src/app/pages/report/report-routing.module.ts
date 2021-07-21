import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActivityComponent } from './activity/activity.component';
import { ExpirationComponent } from './expiration/expiration.component';
import { HistoryReportComponent } from './history-report/history-report.component';
import { PaymentReportComponent } from './payment-report/payment-report.component';
import { PendingReportComponent } from './pending-report/pending-report.component';
import { ProfessionalReportComponent } from './professional-report/professional-report.component';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';
import { ServiceReportComponent } from './service-report/service-report.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'shedule',
        component: ScheduleReportComponent,
      },
      {
        path: 'expiration',
        component: ExpirationComponent,
      },
      {
        path: 'history',
        component: HistoryReportComponent,
      },
      {
        path: 'pending',
        component: PendingReportComponent,
      },
      {
        path: 'professional',
        component: ProfessionalReportComponent,
      },
      {
        path: 'payment',
        component: PaymentReportComponent,
      },
      {
        path: 'service',
        component: ServiceReportComponent,
      },
      {
        path: 'activity',
        component: ActivityComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
