import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BreadcrumbModule } from './components';
import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {ClickOutsideModule} from 'ng-click-outside';
import 'hammerjs';
import 'mousetrap';
import {GalleryModule} from '@ks89/angular-modal-gallery';
import {SpinnerComponent} from './components/spinner/spinner.component';
import { LoaderComponent } from 'src/app/pages/common/loader/loader.component';
import { DashboardComponent } from 'src/app/pages/common/dashboard/dashboard.component';
import { ToastyModule } from 'ng2-toasty';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CreditCardDirectivesModule } from 'angular-cc-library';
import { DashboardAdminComponent } from 'src/app/pages/common/dashboard-admin/dashboard-admin.component';
import { ChartModule } from 'angular2-chartjs';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin
]);

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    GalleryModule.forRoot(),
    ClickOutsideModule,
    DataTablesModule,
    NgSelectModule,
    FullCalendarModule,
    Ng2SearchPipeModule,
    ColorPickerModule,
    ToastyModule.forRoot(),
    NgbModule,
    CreditCardDirectivesModule,
    ChartModule
  ],
  exports: [
    CommonModule,
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    GalleryModule,
    ClickOutsideModule,
    SpinnerComponent,
    LoaderComponent,
    DashboardComponent,
    ToastyModule,
    DataTablesModule,
    FullCalendarModule,
    Ng2SearchPipeModule,
    ColorPickerModule,
    NgSelectModule,
    NgbModule,
    CreditCardDirectivesModule,
    DashboardAdminComponent,
    ChartModule
  ],
  declarations: [
    SpinnerComponent,
    LoaderComponent,
    DashboardComponent,
    DashboardAdminComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule { }
