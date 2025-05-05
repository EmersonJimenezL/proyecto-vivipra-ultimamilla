// asignar-despacho-modal.component.ts
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
  selector: 'app-asignar-despacho-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './asignar-despacho-modal.component.html',
  styleUrls: ['./asignar-despacho-modal.component.scss'],
})
export class AsignarDespachoModalComponent implements OnInit {
  tipoEntrega: 'Interno' | 'Externo' | null = null;
  choferSeleccionado: string | null = null;
  choferesDisponibles: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<AsignarDespachoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { folio: string },
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getDataUser().subscribe({
      next: (usuarios) => {
        this.choferesDisponibles = usuarios.filter(
          (u: any) => u.rol === 'chofer'
        );
      },
      error: (err) => console.error('Error al cargar usuarios:', err),
    });
  }

  seleccionarTipo(tipo: 'Interno' | 'Externo') {
    this.tipoEntrega = tipo;
  }

  confirmar(): void {
    if (!this.tipoEntrega || !this.choferSeleccionado) {
      alert('Debe seleccionar tipo de entrega y un chofer');
      return;
    }

    this.dialogRef.close({
      tipoEntrega: this.tipoEntrega,
      chofer: this.choferSeleccionado,
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
