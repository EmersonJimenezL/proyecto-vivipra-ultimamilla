import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = (allowedRoles: string[] = []): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const userRol = authService.getRol();

    // Si se especificaron roles permitidos, verificamos
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRol || '')) {
      router.navigate(['/unauthorized']); // Opcionalmente crea una vista 401
      return false;
    }

    return true;
  };
};
