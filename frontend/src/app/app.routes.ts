import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { DispatchViewComponent } from './pages/dispatch-view/dispatch-view.component';
import { DeliveredFormComponent } from './pages/delivered-form/delivered-form.component';
import { ModalMapComponent } from './pages/modal-map/modal-map.component';
import { UnauthorizedComponentComponent } from './pages/unauthorized-component/unauthorized-component.component';

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
    canActivate: [authGuard], //protegido por el guard
  },
  {
    path: 'dispatch-view',
    component: DispatchViewComponent,
  },
  {
    path: 'delivered-form',
    component: DeliveredFormComponent,
  },
  {
    path: 'modal-map',
    component: ModalMapComponent,
  },
  {
    path: 'unauthorized-component',
    component: UnauthorizedComponentComponent,
  },
  { path: '**', redirectTo: '/login' },
];

// {
//   path: 'chofer-view',
//   canActivate: [authGuard(['CHOFER'])], // Solo CHOFER
//   loadComponent: () => import('./chofer-view/chofer-view.component').then(m => m.ChoferViewComponent),
// },
// {
//   path: 'available-view',
//   canActivate: [authGuard()], // Cualquier usuario logueado puede entrar
//   loadComponent: () => import('./available-view/available-view.component').then(m => m.AvailableViewComponent),
// },
// ];
