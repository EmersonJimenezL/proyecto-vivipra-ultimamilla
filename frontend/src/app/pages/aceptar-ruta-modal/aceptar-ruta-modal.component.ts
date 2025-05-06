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

  private formatFechaLocal(fecha: Date): string {
    return `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`;
  }

  // Función que formatea la hora en formato local HH:mm:ss
  private formatHoraLocal(fecha: Date): string {
    return `${fecha.getHours().toString().padStart(2, '0')}:${fecha
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${fecha.getSeconds().toString().padStart(2, '0')}`;
  }
  ngOnInit(): void {}

  confirmar(): void {
    if (!this.patente.trim()) {
      alert('Por favor ingresa una patente válida.');
      return;
    }

    const hoy = new Date();
    const fechaFormateada = this.formatFechaLocal(hoy);
    const horaFormateada = this.formatHoraLocal(hoy);

    // Guardar la patente en localStorage para uso posterior (por ejemplo en delivered-form)
    localStorage.setItem('patente', this.patente);
    localStorage.setItem('horaDespacho', fechaFormateada);
    localStorage.setItem('fechaDespacho', horaFormateada);

    // Cerrar el modal con respuesta positiva
    this.dialogRef.close(true);
  }

  cancelar(): void {
    // Cerrar el modal sin acción
    this.dialogRef.close(null);
  }
}
