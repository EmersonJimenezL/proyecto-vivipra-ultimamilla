import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-available-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatPaginatorModule,
    ScrollingModule,
    MatSort,
    MatSortModule,
  ],
  templateUrl: './available-view.component.html',
  styleUrl: './available-view.component.scss',
})
export class AvailableViewComponent implements OnInit {
  displayedColumns: string[] = [
    'select',
    'FolioNum',
    'CodCliente',
    'NombreCliente',
    'FechaDocumento',
    'HoraCreacion',
    'Articulo',
    'Cantidad',
  ];

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);

  // Agregamos esta propiedad para almacenar los folios de despachos existentes
  despachosExistentes: Set<string> = new Set();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Primero obtenemos los despachos existentes y luego los datos de la vista
    this.chargeData();
  }

  chargeData(): void {
    // Obtenemos los despachos existentes
    this.authService.getDataDispatch().subscribe({
      next: (despachos) => {
        // Creamos un conjunto de folios para búsqueda eficiente
        this.despachosExistentes = new Set(
          despachos.map((despacho: any) => despacho.folio)
        );

        // Ahora obtenemos los datos de la vista
        this.getDataView();
      },
      error: (error) => console.error('Error al obtener despachos:', error),
    });
  }

  getDataView(): void {
    this.authService.getData().subscribe({
      next: (data) => {
        // Procesamiento existente de fechas
        data.forEach((item: any) => {
          // Convertir FechaDocumento a Date
          const fecha = new Date(item.FechaDocumento);

          // Asegurarse que HoraCreacion tenga 6 dígitos
          const padded = item.HoraCreacion.toString().padStart(6, '0');
          const horas = parseInt(padded.substring(0, 2), 10);
          const minutos = parseInt(padded.substring(2, 4), 10);
          const segundos = parseInt(padded.substring(4, 6), 10);

          // Combinar fecha + hora correctamente
          fecha.setHours(horas);
          fecha.setMinutes(minutos);
          fecha.setSeconds(segundos);

          // Guardar como propiedad auxiliar para ordenar
          item._fechaHoraCompleta = fecha;
        });

        // NUEVO: Filtrar para mostrar solo los elementos que no están en despacho
        const datosFiltrados = data.filter(
          (item: any) => !this.despachosExistentes.has(item.FolioNum)
        );

        // Usar los datos filtrados para la tabla
        this.dataSource = new MatTableDataSource(datosFiltrados);

        // Configuración existente de ordenamiento
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  isAllSelected() {
    const filteredData = this.dataSource.filteredData;
    return (
      this.selection.selected.length > 0 &&
      filteredData.every((row) => this.selection.isSelected(row))
    );
  }

  toggleAllRows(event: any) {
    const filteredData = this.dataSource.filteredData;

    if (event.checked) {
      this.selection.select(...filteredData);
    } else {
      this.selection.deselect(...filteredData);
    }
  }

  toggleRow(row: any) {
    this.selection.toggle(row);
  }

  async addToDispatch() {
    const selected = this.selection.selected;
    if (selected.length === 0) return;

    const hoy = new Date();
    const fechaFormateada = `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;

    const horaFormateada = `${hoy.getHours().toString().padStart(2, '0')}:${hoy
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${hoy.getSeconds().toString().padStart(2, '0')}`;

    // Creamos un array para almacenar las promesas de las solicitudes
    const requests: any = [];

    selected.forEach((item) => {
      const payload = {
        folio: item.FolioNum,
        fechaDespacho: fechaFormateada,
        horaDespacho: horaFormateada,
        nombreCliente: item.NombreCliente,
        rutCliente: item['Cod.Cliente'],
        articulos: [
          {
            codigo: item.Articulo,
            nombre: item.Descripcion || 'No definido',
            cantidad: item.Cantidad,
          },
        ],
        estado: 'Despacho',
      };

      console.log('Enviando payload:', payload);

      // Agregamos cada solicitud a nuestro array usando firstValueFrom
      requests.push(firstValueFrom(this.authService.saveData(payload)));
    });

    try {
      // Esperamos a que todas las solicitudes se completen
      await Promise.all(requests);

      alert('Despachos creados correctamente');

      // Actualizamos los folios existentes
      selected.forEach((item) => {
        this.despachosExistentes.add(item.FolioNum);
      });

      // Limpiamos la selección
      this.selection.clear();

      // Actualizamos la vista (filtramos los elementos que ya están en despacho)
      this.dataSource.data = this.dataSource.data.filter(
        (item: any) => !this.despachosExistentes.has(item.FolioNum)
      );
    } catch (err) {
      console.error('Error al guardar despachos:', err);
      alert(
        'Hubo un error al crear los despachos. Por favor, inténtelo de nuevo.'
      );
    }
  }

  // Método para recargar los datos
  recargarDatos() {
    this.chargeData();
  }
}
