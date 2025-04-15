import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-dispatch-view',
  standalone: true,
  imports: [
    MatSortModule,
    ScrollingModule,
    MatPaginatorModule,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatPaginator,
    MatSort,
  ],
  templateUrl: './dispatch-view.component.html',
  styleUrl: './dispatch-view.component.scss',
})
export class DispatchViewComponent implements OnInit {
  displayedColumns: string[] = [
    'select',
    'folio',
    'fechaDespacho',
    'horaDespacho',
    'nombreCliente',
    'rutCliente',
    'codigoArticulo',
    'nombreArticulo',
    'cantidad',
    'estado',
  ];

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.authService.getDataDispatch().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);

        // Ordenar por la propiedad auxiliar
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property === 'FechaDocumento') {
            return item._fechaHoraCompleta;
          }
          return item[property];
        };

        this.dataSource.sort = this.sort;

        setTimeout(() => {
          this.sort.active = 'FechaDocumento';
          this.sort.direction = 'desc';
          this.sort.sortChange.emit({
            active: 'FechaDocumento',
            direction: 'desc',
          });
        });

        this.dataSource.paginator = this.paginator;
      },
      error: (error) => console.error('Error al obtener datos:', error),
    });
  }

  formatTime(time: string): string {
    if (!time) return '';

    // Convertir a string si es número
    const timeString = time.toString();

    // Asegurarse de que tenga 6 dígitos (añadir ceros a la izquierda si es necesario)
    const paddedTime = timeString.padStart(6, '0');

    // Extraer horas, minutos y segundos
    let hours = parseInt(paddedTime.substring(0, 2), 10);
    const minutes = paddedTime.substring(2, 4);
    const seconds = paddedTime.substring(4, 6);

    // Eliminar el cero inicial de la hora si es menor que 10
    const formattedHours = hours < 10 ? hours.toString() : hours.toString();

    return `${hours}:${minutes}:${seconds}`;
  }

  // realizar entrega del pedido
  delivered() {
    console.log('Dispatch delivered');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(event: any) {
    event.checked
      ? this.selection.select(...this.dataSource.data)
      : this.selection.clear();
  }

  toggleRow(row: any) {
    this.selection.toggle(row);
  }

  reloadData() {
    this.getData();
  }
}
