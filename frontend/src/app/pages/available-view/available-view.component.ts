import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-available-view',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './available-view.component.html',
  styleUrl: './available-view.component.scss',
})
export class AvailableViewComponent {
  displayedColumns: string[] = ['numero', 'fecha', 'producto', 'accion'];

  // Simulación temporal
  dataSource = [
    { numero: 'FAC001', fecha: '2025-04-10', producto: 'Producto A' },
    { numero: 'FAC002', fecha: '2025-04-09', producto: 'Producto B' },
  ];

  listosParaDespacho: any[] = [];

  agregarADespacho(factura: any) {
    if (!this.listosParaDespacho.find((f) => f.numero === factura.numero)) {
      this.listosParaDespacho.push(factura);
      console.log('Agregado a despacho:', factura);
    }
  }
}
