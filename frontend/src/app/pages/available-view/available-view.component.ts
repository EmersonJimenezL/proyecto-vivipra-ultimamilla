// Importaciones necesarias de Angular y Angular Material
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
import { Router } from '@angular/router';

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

  rutaActiva: boolean = false;
  rutaBloqueada: boolean = false;
  choferesConRutaActiva: string[] = [];

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargeData();
    this.verificarRutasActivas();
    if (this.rutaBloqueada) {
      alert(
        'La ruta ha sido bloqueada porque un chofer inició el despacho. No se pueden asignar más pedidos hasta que finalice.'
      );
    }
  }

  verificarRutasActivas(): void {
    Promise.all([
      this.authService.getDataDispatch().toPromise(),
      this.authService.getDataUser().toPromise(),
    ])
      .then(([despachos, usuarios]) => {
        const choferesValidos = usuarios
          .filter((u: any) => u.rol === 'chofer')
          .map((u: any) => u.nombreUsuario);

        const despachosActivosValidos = despachos.filter(
          (d: any) =>
            d.estado === 'Despacho' &&
            choferesValidos.includes(d.chofer) &&
            d.fechaDespacho // solo si el chofer inició efectivamente la ruta
        );

        this.choferesConRutaActiva = despachosActivosValidos.map(
          (d: any) => d.chofer
        );
        this.choferesConRutaActiva = despachosActivosValidos.map(
          (d: any) => d.chofer
        );
      })
      .catch((error) => {
        console.error('Error al verificar rutas activas con usuarios:', error);
      });
  }

  iniciarAsignacionRuta(): void {
    if (this.rutaBloqueada) return;
    this.rutaActiva = true;
  }

  finalizarAsignacionRuta(): void {
    this.rutaActiva = false;
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

  async addToDispatch() {
    const selected = this.selection.selected;
    if (selected.length === 0 || !this.rutaActiva) return;

    const requests: Promise<any>[] = [];
    const foliosExitosos: string[] = [];

    for (const item of selected) {
      const result = await this.dialog
        .open(AsignarDespachoModalComponent, {
          data: {
            folio: item.FolioNum,
            choferesBloqueados: this.choferesConRutaActiva,
          },
          disableClose: true,
        })
        .afterClosed()
        .toPromise();

      if (!result) {
        alert(
          `Asignación cancelada para el despacho con folio ${item.FolioNum}.`
        );
        continue;
      }

      const payload = {
        folio: item.FolioNum,
        nombreCliente: item.NombreCliente,
        rutCliente: item['Cod.Cliente'],
        estado: 'Despacho',
        direccion: item.Direccion,
        comentarioDespacho: item.Comentarios,
        tipoEntrega: result.tipoEntrega,
        chofer: result.chofer,
        asignadoPor: this.authService.getNombreUsuario(),
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

      // Revalidar rutas activas de forma reactiva
      this.verificarRutasActivas();
    } catch (err) {
      console.error('Error al guardar despachos:', err);
      alert(
        'Hubo un error al crear los despachos. Por favor, inténtelo de nuevo.'
      );
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
