import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PromocodeComponent } from './promocode/promocode.component';
import { ResponseComponent } from './response/response.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'promocode',
        component: PromocodeComponent,
      },
      {
        path: 'response',
        component:  ResponseComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
