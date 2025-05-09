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
      nombreUsuario: ['', Validators.required],
      password: ['', Validators.required],
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
      this.loading = true;

      // Asegúrate de que el formulario tenga estos nombres de campo
      const { nombreUsuario, password } = this.loginForm.value;

      this.authService.login(nombreUsuario, password).subscribe({
        next: (res) => {
          this.loading = false;

          // Guarda los datos que vienen desde el backend
          this.authService.setSession(res.usuario); // <- lo defines en tu servicio
          console.log('Respuesta del login:', res);

          this.authService.startAutoLogout();

          const rol = res.usuario.rol;
          const userId = res.usuario.nombreUsuario;
          const nombre = res.usuario.nombreUsuario;

          if (rol === 'chofer') {
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
                  this.authService.logout();
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
                      this.authService.logout();
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
                this.authService.logout();
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
