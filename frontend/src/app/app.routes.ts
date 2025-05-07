import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { DispatchViewComponent } from './pages/dispatch-view/dispatch-view.component';
import { DeliveredFormComponent } from './pages/delivered-form/delivered-form.component';
import { ModalMapComponent } from './pages/modal-map/modal-map.component';
import { UnauthorizedComponentComponent } from './pages/unauthorized-component/unauthorized-component.component';
import { AdminViewComponent } from './pages/admin-view/admin-view.component';

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
    path: 'available-view',
    loadComponent: () =>
      import('./pages/available-view/available-view.component').then(
        (m) => m.AvailableViewComponent
      ),
    canActivate: [authGuard(['bodega'])],
  },
  {
    path: 'dispatch-view',
    component: DispatchViewComponent,
    canActivate: [authGuard(['admin', 'chofer'])],
  },
  {
    path: 'delivered-form',
    component: DeliveredFormComponent,
    canActivate: [authGuard(['admin', 'chofer'])],
  },
  {
    path: 'modal-map',
    component: ModalMapComponent,
    canActivate: [authGuard(['admin', 'chofer'])],
  },
  {
    path: 'unauthorized-component',
    component: UnauthorizedComponentComponent,
  },
  {
    path: 'admin-view',
    component: AdminViewComponent,
    canActivate: [authGuard(['admin', 'bodega'])],
  },
  { path: '**', redirectTo: '/login' },
];
