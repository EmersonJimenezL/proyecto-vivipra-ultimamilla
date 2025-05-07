// Importación de decoradores, módulos y servicios necesarios
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
  selector: 'app-login', // Selector del componente
  standalone: true, // Declarado como componente standalone
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
  templateUrl: './login.component.html', // HTML asociado
  styleUrl: './login.component.scss', // Estilos asociados
})
export class LoginComponent {
  loginForm: FormGroup; // Formulario reactivo
  hidePassword = true; // Controla si el campo de contraseña está oculto
  loading = false; // Indicador de carga al hacer login

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Inicializa el formulario reactivo con validaciones requeridas
    this.loginForm = this.fb.group({
      nombre_usuario: ['', Validators.required],
      contrasenna: ['', Validators.required],
    });
  }

  // Verifica si el usuario ya tiene una sesión activa al cargar el componente
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const rol = this.authService.getRol(); // Obtiene el rol desde el servicio

      // Redirección automática según el rol del usuario
      if (rol === 'chofer') {
        this.router.navigate(['/dispatch-view']);
      } else if (rol === 'admin') {
        this.router.navigate(['/admin-view']);
      } else {
        this.router.navigate(['/available-view']);
      }
    }
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true; // Activa el estado de carga
      const { nombre_usuario, contrasenna } = this.loginForm.value;

      // Llama al servicio de login con los datos del formulario
      this.authService.login(nombre_usuario, contrasenna).subscribe({
        next: () => {
          this.loading = false;
          this.authService.startAutoLogout(); // Inicia temporizador de auto logout

          const rol = this.authService.getRol();
          const userId = this.authService.getUserId();
          const nombre = this.authService.getNombre(); // Nombre del chofer

          if (rol === 'chofer') {
            // Si es chofer, verificar si tiene despachos asignados
            this.authService.getDataDispatch().subscribe({
              next: (data: any[]) => {
                // Filtra despachos por chofer y estado "Despacho"
                const despachos = data.filter(
                  (d) => d.chofer === nombre && d.estado === 'Despacho'
                );

                // Si no hay despachos, se informa y se cierra sesión
                if (despachos.length === 0) {
                  this.snackBar.open(
                    'No tienes despachos pendientes asignados.',
                    'Cerrar',
                    { duration: 4000, panelClass: ['snackbar-error'] }
                  );
                  this.authService.logout(); // Finaliza la sesión
                  return;
                }

                // Abre modal para que el chofer acepte la ruta
                const dialogRef = this.dialog.open(AceptarRutaModalComponent, {
                  disableClose: true, // Evita que se cierre sin decisión
                  data: { id: userId }, // Pasa el ID del usuario al modal
                });

                // Maneja el resultado del modal
                dialogRef
                  .afterClosed()
                  .subscribe((accepted: boolean | null) => {
                    if (accepted) {
                      // Si aceptó la ruta, redirige a la vista de despachos
                      this.router.navigate(['/dispatch-view']);
                    } else {
                      // Si no aceptó o cerró, cierra sesión por seguridad
                      this.authService.logout();
                    }
                  });
              },
              error: (err) => {
                // Si ocurre un error al verificar los despachos
                console.error('Error al verificar despachos:', err);
                this.snackBar.open(
                  'Error al verificar despachos. Intenta nuevamente.',
                  'Cerrar',
                  { duration: 4000, panelClass: ['snackbar-error'] }
                );
                this.authService.logout(); // Cierra sesión por seguridad
              },
            });
          } else if (rol === 'admin') {
            this.router.navigate(['/admin-view']); // Redirige al panel de administrador
          } else {
            this.router.navigate(['/available-view']); // Redirige a vista general
          }
        },
        error: () => {
          // En caso de error en login (credenciales incorrectas)
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
