// Importación de elementos base para componentes, inyección de datos y módulos de Angular Material
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-asignar-despacho-modal', // Selector del modal
  standalone: true, // Componente standalone (sin módulo externo)
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './asignar-despacho-modal.component.html', // Plantilla HTML del modal
  styleUrls: ['./asignar-despacho-modal.component.scss'], // Estilos específicos
})
export class AsignarDespachoModalComponent implements OnInit {
  tipoEntrega: 'Interno' | 'Externo' | null = null; // Tipo de entrega seleccionada
  choferSeleccionado: string | null = null; // Chofer seleccionado por el usuario
  choferesDisponibles: any[] = []; // Lista de usuarios con rol "chofer"

  constructor(
    private dialogRef: MatDialogRef<AsignarDespachoModalComponent>, // Control del modal
    @Inject(MAT_DIALOG_DATA) public data: { folio: string }, // Recibe el folio del despacho
    private authService: AuthService // Servicio para obtener usuarios
  ) {}

  // Al iniciar el componente, se cargan los choferes desde el backend
  ngOnInit(): void {
    this.authService.getDataUser().subscribe({
      next: (usuarios) => {
        // Filtra los usuarios que tienen rol "chofer"
        this.choferesDisponibles = usuarios.filter(
          (u: any) => u.rol === 'chofer'
        );
      },
      error: (err) => console.error('Error al cargar usuarios:', err),
    });
  }

  // Establece el tipo de entrega seleccionado (Interno o Externo)
  seleccionarTipo(tipo: 'Interno' | 'Externo') {
    this.tipoEntrega = tipo;
  }

  // Valida que ambos campos estén seleccionados antes de cerrar el modal con los datos
  confirmar(): void {
    if (!this.tipoEntrega || !this.choferSeleccionado) {
      alert('Debe seleccionar tipo de entrega y un chofer');
      return;
    }

    // Retorna los datos seleccionados al componente padre
    this.dialogRef.close({
      tipoEntrega: this.tipoEntrega,
      chofer: this.choferSeleccionado,
    });
  }

  // Cierra el modal sin realizar ninguna acción
  cancelar(): void {
    this.dialogRef.close(null);
  }
}
