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
    ClickOutsideModule
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
    LoaderComponent
  ],
  declarations: [
    SpinnerComponent,
    LoaderComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule { }
