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
import { AngularCalendarYearViewModule } from 'angular-calendar-year-view';


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
    AngularCalendarYearViewModule,
    ToastyModule.forRoot()
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
    NgSelectModule,
    AngularCalendarYearViewModule
  ],
  declarations: [
    SpinnerComponent,
    LoaderComponent,
    DashboardComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule { }
