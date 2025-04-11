import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-available-view',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './available-view.component.html',
  styleUrl: './available-view.component.scss',
})
export class AvailableViewComponent {
  constructor(private authService: AuthService) {}

  displayedColumns: string[] = [
    'FolioNum',
    'CodCliente',
    'NombreCliente',
    'FechaDocumento',
    'HoraCreacion',
    'Articulo',
    'Cantidad',
  ];

  data: any = [];

  ngOnInit(): void {
    this.authService.getData().subscribe({
      next: (data) => {
        this.data = data;
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
      },
    });
  }

  agregarADespacho() {
    console.log('Agregar a despacho');
  }
}
