import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { AvailableViewComponent } from './pages/available-view/available-view.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'scan',
    loadComponent: () =>
      import('./pages/scan/scan.component').then((m) => m.ScanComponent),
    canActivate: [authGuard], // 👈 protegido por el guard
  },
  {
    path: 'available-view',
    component: AvailableViewComponent,
  },
];
