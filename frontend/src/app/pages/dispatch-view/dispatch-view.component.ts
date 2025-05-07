// Importación de decoradores y módulos básicos de Angular
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material: tabla, botones, íconos, formularios, etc.
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

// CDK para scroll virtual y detección de tamaños de pantalla (responsivo)
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectionModel } from '@angular/cdk/collections';
import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';
import { MatDialogModule } from '@angular/material/dialog';

// Pipe personalizada para sanitizar URLs si se usara en la vista
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

// Servicios y componentes propios
import { AuthService } from '../../services/auth.service';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalMapComponent } from '../modal-map/modal-map.component';
import { AceptarRutaModalComponent } from '../aceptar-ruta-modal/aceptar-ruta-modal.component';

@Component({
  selector: 'app-dispatch-view', // Nombre del componente en el HTML
  standalone: true, // Componente standalone (no requiere módulo aparte)
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
  templateUrl: './dispatch-view.component.html', // HTML de la vista
  styleUrl: './dispatch-view.component.scss', // Estilos asociados
})
export class DispatchViewComponent implements OnInit {
  // Columnas a mostrar en la tabla según el diseño
  displayedColumns: string[] = [
    'folio',
    'rutCliente',
    'nombreCliente',
    'Direccion',
    'mapa',
    'Entrega',
  ];

  dataSource = new MatTableDataSource<any>([]); // Fuente de datos para la tabla
  selection = new SelectionModel<any>(true, []); // Permite selección múltiple
  expandedItem: any = null; // Controla qué ítem está expandido en móviles
  isMobile = false; // Bandera para detectar vista móvil

  // Referencias a paginador y ordenamiento
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver, // Detecta si es pantalla pequeña
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Detecta si el usuario está en un dispositivo móvil
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    // Carga de datos desde backend
    this.getData();
  }

  // Lógica para obtener despachos, filtrarlos si es chofer y configurar tabla
  getData() {
    const rol = this.authService.getRol(); // Rol del usuario actual
    const nombreChofer = this.authService.getNombreUsuario(); // Nombre del chofer autenticado

    this.authService.getDataDispatch().subscribe({
      next: (data) => {
        let despachosFiltrados = data;

        if (rol === 'chofer') {
          // Solo muestra despachos con estado "Despacho" y asignados a este chofer
          despachosFiltrados = data.filter(
            (d: any) =>
              d.chofer?.toLowerCase() === nombreChofer.toLowerCase() &&
              d.estado === 'Despacho'
          );
        }

        // Configura la fuente de datos de la tabla
        this.dataSource = new MatTableDataSource(despachosFiltrados);

        // Define cómo ordenar por la propiedad 'FechaDocumento'
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property === 'FechaDocumento') {
            return item._fechaHoraCompleta;
          }
          return item[property];
        };

        // Asigna componentes de ordenamiento y paginador
        this.dataSource.sort = this.sort;

        // Establece ordenamiento por defecto después de un pequeño delay
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

  // Permite expandir o contraer una fila para mostrar más detalles
  toggleExpansion(item: any) {
    this.expandedItem = this.expandedItem === item ? null : item;
  }

  // Aplica un filtro global de texto en la tabla
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Abre un modal con el mapa basado en la dirección entregada
  abrirMapa(direccion: string): void {
    this.dialog.open(ModalMapComponent, {
      width: '600px',
      data: { direccion },
    });
  }

  // Navega al formulario de entrega con los datos del despacho seleccionado
  delivered(despacho: any): void {
    const extras: NavigationExtras = {
      state: { despacho }, // Envía el despacho como estado de navegación
    };
    this.router.navigate(['/delivered-form'], extras);
  }

  // Cierra sesión y redirige al login
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
