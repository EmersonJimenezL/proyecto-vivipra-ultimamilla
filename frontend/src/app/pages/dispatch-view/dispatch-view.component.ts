// Importación de decoradores y módulos básicos de Angular
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material: tabla y su fuente de datos
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

// CDK para desplazamiento y diseño responsivo
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectionModel } from '@angular/cdk/collections';
import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';
import { MatDialogModule } from '@angular/material/dialog';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

// Servicios
import { AuthService } from '../../services/auth.service';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalMapComponent } from '../modal-map/modal-map.component';
import { AceptarRutaModalComponent } from '../aceptar-ruta-modal/aceptar-ruta-modal.component';

@Component({
  selector: 'app-dispatch-view',
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
    LayoutModule,
    MatDialogModule,
  ],
  templateUrl: './dispatch-view.component.html',
  styleUrl: './dispatch-view.component.scss',
})
export class DispatchViewComponent implements OnInit {
  displayedColumns: string[] = [
    'folio',
    'rutCliente',
    'nombreCliente',
    'Direccion',
    'mapa',
    'Entrega',
  ];

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  expandedItem: any = null;
  isMobile = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    this.getData();
  }

  getData() {
    const rol = this.authService.getRol();
    const nombreChofer = this.authService.getNombreUsuario();

    this.authService.getDataDispatch().subscribe({
      next: (data) => {
        let despachosFiltrados = data;

        if (rol === 'chofer') {
          // FILTRAMOS por chofer Y por estado === 'Despacho'
          despachosFiltrados = data.filter(
            (d: any) =>
              d.chofer?.toLowerCase() === nombreChofer.toLowerCase() &&
              d.estado === 'Despacho'
          );
        }

        this.dataSource = new MatTableDataSource(despachosFiltrados);

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

  toggleExpansion(item: any) {
    this.expandedItem = this.expandedItem === item ? null : item;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  abrirMapa(direccion: string): void {
    this.dialog.open(ModalMapComponent, {
      width: '600px',
      data: { direccion },
    });
  }

  delivered(despacho: any): void {
    const extras: NavigationExtras = {
      state: { despacho },
    };
    this.router.navigate(['/delivered-form'], extras);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
