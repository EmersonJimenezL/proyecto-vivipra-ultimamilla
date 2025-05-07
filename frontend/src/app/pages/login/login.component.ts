import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AceptarRutaModalComponent } from '../aceptar-ruta-modal/aceptar-ruta-modal.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const rol = this.authService.getRol();
      //console.log(rol);

      if (rol === 'chofer') {
        this.router.navigate(['/dispatch-view']);
      } else if (rol === 'admin') {
        this.router.navigate(['/admin-view']);
      } else {
        this.router.navigate(['/available-view']);
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      nombre_usuario: ['', Validators.required],
      contrasenna: ['', Validators.required],
    });
  }

  // Método onSubmit actualizado con lógica de redirección según rol
  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { nombre_usuario, contrasenna } = this.loginForm.value;

      this.authService.login(nombre_usuario, contrasenna).subscribe({
        next: () => {
          this.loading = false;
          this.authService.startAutoLogout();

          const rol = this.authService.getRol();
          const userId = this.authService.getUserId();
          const nombre = this.authService.getNombre(); // nombre del chofer

          if (rol === 'chofer') {
            // ✅ Validar que tenga despachos pendientes antes de abrir el modal
            this.authService.getDataDispatch().subscribe({
              next: (data: any[]) => {
                const despachos = data.filter(
                  (d) => d.chofer === nombre && d.estado === 'Despacho'
                );

                if (despachos.length === 0) {
                  this.snackBar.open(
                    'No tienes despachos pendientes asignados.',
                    'Cerrar',
                    { duration: 4000, panelClass: ['snackbar-error'] }
                  );
                  this.authService.logout(); // evita que quede sesión iniciada
                  return;
                }

                const dialogRef = this.dialog.open(AceptarRutaModalComponent, {
                  disableClose: true,
                  data: { id: userId },
                });

                dialogRef
                  .afterClosed()
                  .subscribe((accepted: boolean | null) => {
                    if (accepted) {
                      this.router.navigate(['/dispatch-view']);
                    } else {
                      this.authService.logout(); // cancela sesión si se cerró el modal sin aceptar
                    }
                  });
              },
              error: (err) => {
                console.error('Error al verificar despachos:', err);
                this.snackBar.open(
                  'Error al verificar despachos. Intenta nuevamente.',
                  'Cerrar',
                  { duration: 4000, panelClass: ['snackbar-error'] }
                );
                this.authService.logout(); // por seguridad
              },
            });
          } else if (rol === 'admin') {
            this.router.navigate(['/admin-view']);
          } else {
            this.router.navigate(['/available-view']);
          }
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Credenciales incorrectas.', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        },
      });
    }
  }
}
