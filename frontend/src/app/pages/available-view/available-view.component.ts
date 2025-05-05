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
import { SharedModule } from '../../shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { AsignarDespachoModalComponent } from '../asignar-despacho-modal/asignar-despacho-modal.component';

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
    SharedModule,
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
    'Direccion',
    'Comentarios',
  ];

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  despachosExistentes: Set<string> = new Set();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authService: AuthService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.chargeData();
  }

  chargeData(): void {
    this.authService.getDataDispatch().subscribe({
      next: (despachosMongo) => {
        const foliosDespachados = new Set(
          despachosMongo
            .map((d: any) => Number(d.folio))
            .filter((folio: number) => !isNaN(folio))
        );

        this.authService.getData().subscribe({
          next: (dataVista) => {
            dataVista.forEach((item: any) => {
              const fecha = new Date(item.FechaDocumento);
              const padded = item.HoraCreacion.toString().padStart(6, '0');
              const horas = parseInt(padded.substring(0, 2), 10);
              const minutos = parseInt(padded.substring(2, 4), 10);
              const segundos = parseInt(padded.substring(4, 6), 10);
              fecha.setHours(horas, minutos, segundos);
              item._fechaHoraCompleta = fecha;
            });

            const datosFiltrados = dataVista.filter(
              (item: any) => !foliosDespachados.has(Number(item.FolioNum))
            );

            this.dataSource = new MatTableDataSource(datosFiltrados);

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
          error: (error) =>
            console.error('Error al obtener datos desde la vista:', error),
        });
      },
      error: (error) =>
        console.error('Error al obtener datos desde Mongo:', error),
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  // Función que formatea la fecha en formato local YYYY-MM-DD
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

  async addToDispatch() {
    const selected = this.selection.selected;
    if (selected.length === 0) return;

    const hoy = new Date();
    const fechaFormateada = this.formatFechaLocal(hoy);
    const horaFormateada = this.formatHoraLocal(hoy);

    const requests: Promise<any>[] = [];
    const foliosExitosos: string[] = [];

    for (const item of selected) {
      const result = await this.dialog
        .open(AsignarDespachoModalComponent, {
          data: { folio: item.FolioNum },
          disableClose: true,
        })
        .afterClosed()
        .toPromise();

      // Si el usuario cancela, pasamos al siguiente sin hacer nada
      if (!result) {
        alert(
          `Asignación cancelada para el despacho con folio ${item.FolioNum}.`
        );
        continue;
      }

      const payload = {
        // primer endpoint que es el POST.
        folio: item.FolioNum,
        nombreCliente: item.NombreCliente,
        rutCliente: item['Cod.Cliente'],
        estado: 'Despacho',
        direccion: item.Direccion,
        comentarioDespacho: item.Comentarios,
        // segundo endpoint
        tipoEntrega: result.tipoEntrega, // desde modal
        chofer: result.chofer, // desde modal
        patente: 'xxxxxx', // será completada luego por el chofer
        asignadoPor: this.authService.getNombreUsuario(), // pendiente de login
      };

      requests.push(
        firstValueFrom(this.authService.saveData(payload)).then(() => {
          foliosExitosos.push(item.FolioNum);
        })
      );
    }

    try {
      await Promise.all(requests);

      if (foliosExitosos.length > 0) {
        alert(
          `Se registraron ${foliosExitosos.length} despacho(s) correctamente.`
        );
      }

      foliosExitosos.forEach((folio) => {
        this.despachosExistentes.add(folio);
      });

      this.selection.clear();

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
}
