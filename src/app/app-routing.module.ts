import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';
import { DashboardComponent } from './pages/common/dashboard/dashboard.component';
import { AdminComponent } from './theme/layout/admin/admin.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
