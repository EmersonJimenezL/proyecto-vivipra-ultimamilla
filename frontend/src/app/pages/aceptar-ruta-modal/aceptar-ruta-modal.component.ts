// Importaciones necesarias para el componente y módulos de Angular Material
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aceptar-ruta-modal', // Selector del modal
  standalone: true, // Componente independiente (standalone)
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './aceptar-ruta-modal.component.html', // HTML del modal
  styleUrl: './aceptar-ruta-modal.component.scss', // Estilos del modal
})
export class AceptarRutaModalComponent implements OnInit {
  patente: string = ''; // Campo para almacenar la patente ingresada
  despachos: any[] = []; // Lista de despachos asignados al chofer

  constructor(
    private dialogRef: MatDialogRef<AceptarRutaModalComponent>, // Referencia para cerrar el modal
    private authService: AuthService // Servicio de autenticación y datos
  ) {}

  ngOnInit(): void {
    // Obtiene el nombre del chofer desde localStorage (asumido como identificador)
    const choferId = localStorage.getItem('nombre');

    // Consulta todos los despachos y filtra los que están asignados a este chofer con estado "Despacho"
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

  // Método que formatea la patente ingresada para cumplir con el formato estándar
  formatearPatente(): void {
    // Elimina caracteres no alfanuméricos y convierte a mayúsculas
    let raw = this.patente.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    raw = raw.slice(0, 6); // Máximo 6 caracteres

    const letras = raw.slice(0, 4); // Primeros 4 caracteres (posibles letras)
    const numeros = raw.slice(4); // Últimos 2 caracteres (posibles números)

    // Aplica formato tipo AB-CD-12
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

  // Método que se ejecuta cuando se confirma el modal
  confirmar(): void {
    if (!this.despachos || this.despachos.length === 0) {
      alert(
        'Los despachos aún no están cargados. Por favor espera unos segundos.'
      );
      return;
    }

    const formatoPatente = /^[A-Z]{2}-[A-Z]{2}-\d{2}$/; // Expresión regular para validar el formato

    // Validación: campo vacío
    if (!this.patente.trim()) {
      alert('Por favor ingresa una patente válida.');
      return;
    }

    // Validación: formato incorrecto
    if (!formatoPatente.test(this.patente.trim().toUpperCase())) {
      alert('La patente ingresada no tiene un formato válido. Ej: AB-CD-12');
      return;
    }

    // Guarda la fecha y hora actual como fecha/hora de despacho
    const ahora = new Date();

    // Almacena los valores localmente (para recuperación en otras vistas)
    localStorage.setItem('patente', this.patente);
    localStorage.setItem('fechaDespacho', ahora.toISOString());
    localStorage.setItem('horaDespacho', ahora.toISOString());

    // Verifica si hay despachos pendientes
    if (this.despachos.length === 0) {
      alert('No existen despachos pendientes');
      console.warn(' No hay despachos en estado "Despacho" para este chofer.');
      return;
    }

    // Actualiza cada despacho con la fecha y hora de despacho
    this.despachos.forEach((despacho) => {
      console.log(despacho);
      if (despacho.horaDespacho) {
        return;
      }

      const payload = {
        fechaDespacho: ahora,
        horaDespacho: ahora,
      };

      // Envía los datos al backend para persistencia
      this.authService.setDataDistpatch(despacho._id, payload).subscribe({
        next: () => {
          console.log(` Despacho ${despacho._id} actualizado`);
        },
        error: (err) => {
          console.error(` Error al actualizar despacho ${despacho._id}:`, err);
        },
      });
    });

    // Cierra el modal indicando que se aceptó la ruta (true)
    this.dialogRef.close(true);
  }

  // Método que se ejecuta al cancelar el modal
  cancelar(): void {
    this.dialogRef.close(null); // Cierra el modal sin aceptar
  }
}
