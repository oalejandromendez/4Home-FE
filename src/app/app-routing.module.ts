import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';
import { DashboardComponent } from './pages/common/dashboard/dashboard.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { AdminComponent } from './theme/layout/admin/admin.component'


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [ AuthGuard ],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.module').then(module => module.AdminModule)
      },
      {
        path: 'scheduling',
        loadChildren: () => import('./pages/scheduling/scheduling.module').then(module => module.SchedulingModule)
      },
      {
        path: 'finance',
        loadChildren: () => import('./pages/finance/finance.module').then(module => module.FinanceModule)
      },
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./pages/auth/auth.module').then(module => module.AuthModule)
      }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'payment/:reserve',
        component: PaymentComponent,
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
