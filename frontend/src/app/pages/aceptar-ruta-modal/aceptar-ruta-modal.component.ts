import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

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
  despachos: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<AceptarRutaModalComponent>,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const choferId = localStorage.getItem('nombre');

    this.authService.getDataDispatch().subscribe({
      next: (data: any[]) => {
        this.despachos = data.filter(
          (d) => d.chofer === choferId && d.estado === 'Despacho'
        );
      },
      error: (err) => {
        console.error('Error al obtener despachos:', err);
      },
    });
  }

  // ✅ Agregado: función para formatear la patente automáticamente
  formatearPatente(): void {
    let raw = this.patente.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    raw = raw.slice(0, 6);

    const letras = raw.slice(0, 4);
    const numeros = raw.slice(4);

    let formatted = '';
    if (letras.length >= 2) {
      formatted += letras.slice(0, 2);
      if (letras.length >= 4) {
        formatted += '-' + letras.slice(2, 4);
      }
    } else {
      formatted += letras;
    }

    if (numeros.length > 0) {
      formatted += '-' + numeros;
    }

    this.patente = formatted;
  }

  confirmar(): void {
    const formatoPatente = /^[A-Z]{2}-[A-Z]{2}-\d{2}$/;

    if (!this.patente.trim()) {
      alert('Por favor ingresa una patente válida.');
      return;
    }

    if (!formatoPatente.test(this.patente.trim().toUpperCase())) {
      alert('La patente ingresada no tiene un formato válido. Ej: AB-CD-12');
      return;
    }

    const ahora = new Date();

    localStorage.setItem('patente', this.patente);
    localStorage.setItem('fechaDespacho', ahora.toISOString());
    localStorage.setItem('horaDespacho', ahora.toISOString());

    if (this.despachos.length === 0) {
      alert('No existen despachos pendientes');
      console.warn(' No hay despachos en estado "Despacho" para este chofer.');
      return;
    }

    this.despachos.forEach((despacho) => {
      const payload = {
        fechaDespacho: ahora,
        horaDespacho: ahora,
      };

      this.authService.setDataDistpatch(despacho._id, payload).subscribe({
        next: () => {
          console.log(` Despacho ${despacho._id} actualizado`);
        },
        error: (err) => {
          console.error(` Error al actualizar despacho ${despacho._id}:`, err);
        },
      });
    });

    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
