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
        // Filtrar solo los que están en estado 'Despacho'
        this.despachos = data.filter(
          (d) => d.chofer === choferId && d.estado === 'Despacho'
        );
      },
      error: (err) => {
        console.error('Error al obtener despachos:', err);
      },
    });
  }

  confirmar(): void {
    if (!this.patente.trim()) {
      alert('Por favor ingresa una patente válida.');
      return;
    }

    const ahora = new Date();

    // Guardar valores en localStorage (por si se usan en otro componente)
    localStorage.setItem('patente', this.patente);
    localStorage.setItem('fechaDespacho', ahora.toISOString());
    localStorage.setItem('horaDespacho', ahora.toISOString());

    if (this.despachos.length === 0) {
      console.warn(
        '⚠️ No hay despachos en estado "Despacho" para este chofer.'
      );
    }

    this.despachos.forEach((despacho) => {
      const payload = {
        fechaDespacho: ahora,
        horaDespacho: ahora,
      };

      console.log('🔄 Enviando a despacho:', despacho._id, payload);

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
