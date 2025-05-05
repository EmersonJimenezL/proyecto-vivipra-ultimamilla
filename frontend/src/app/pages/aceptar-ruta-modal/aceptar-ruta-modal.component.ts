import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-aceptar-ruta-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './aceptar-ruta-modal.component.html',
  styleUrl: './aceptar-ruta-modal.component.scss',
})
export class AceptarRutaModalComponent implements OnInit {
  patente: string = '';

  constructor(
    private dialogRef: MatDialogRef<AceptarRutaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) {}

  ngOnInit(): void {}

  confirmar(): void {
    if (!this.patente.trim()) {
      alert('Por favor ingresa una patente válida.');
      return;
    }

    // Guardar la patente en localStorage para uso posterior (por ejemplo en delivered-form)
    localStorage.setItem('patente', this.patente);

    // Cerrar el modal con respuesta positiva
    this.dialogRef.close(true);
  }

  cancelar(): void {
    // Cerrar el modal sin acción
    this.dialogRef.close(null);
  }
}
