import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { DispatchViewComponent } from './pages/dispatch-view/dispatch-view.component';

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
    canActivate: [authGuard], // protegido por el guard
  },
  {
    path: 'available-view',
    loadComponent: () =>
      import('./pages/available-view/available-view.component').then(
        (m) => m.AvailableViewComponent
      ),
    canActivate: [authGuard], //protegido por el guard
  },
  {
    path: 'dispatch-view',
    component: DispatchViewComponent,
  },
];
