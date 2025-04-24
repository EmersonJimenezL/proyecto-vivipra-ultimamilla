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
  BreakpointObserver, // Observa el tamaño de pantalla
  Breakpoints, // Conjunto de puntos de corte predefinidos (como móvil, tablet, etc.)
  LayoutModule,
} from '@angular/cdk/layout';
import { MatDialogModule } from '@angular/material/dialog';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

// Servicios
import { AuthService } from '../../services/auth.service';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalMapComponent } from '../modal-map/modal-map.component';

@Component({
  selector: 'app-dispatch-view', // Selector HTML del componente
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
  templateUrl: './dispatch-view.component.html', // Vista asociada
  styleUrl: './dispatch-view.component.scss', // Estilos asociados
})
export class DispatchViewComponent implements OnInit {
  // Columnas que se van a mostrar en la tabla
  displayedColumns: string[] = [
    'folio',
    'rutCliente',
    'nombreCliente',
    'Direccion',
    'mapa',
    'Entrega', // Botón o acción para realizar la entrega
  ];

  // Fuente de datos de la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Modelo para seleccionar filas (aunque no se está usando aquí aún)
  selection = new SelectionModel<any>(true, []);

  // Almacena qué elemento está expandido (para vista móvil)
  expandedItem: any = null;

  // Flag para saber si estamos en pantalla móvil
  isMobile = false;

  // Referencias al paginador y ordenamiento de la tabla
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService, // Servicio para obtener datos del backend
    private breakpointObserver: BreakpointObserver, // Detecta si estamos en móvil/tablet
    private router: Router, // Para navegar entre rutas
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Observa si el dispositivo es "Handset" (móvil)
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches; // Si estamos en móvil, se activa el flag
      });

    // Cargamos los datos para la tabla
    this.getData();
  }

  // Carga los datos de los despachos desde el backend
  getData() {
    this.authService.getDataDispatch().subscribe({
      // next: se ejecuta cuando recibimos respuesta correcta
      next: (data) => {
        // Creamos una nueva fuente de datos con los datos recibidos
        this.dataSource = new MatTableDataSource(data);

        // Configuramos el ordenamiento personalizado
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property === 'FechaDocumento') {
            return item._fechaHoraCompleta; // Usamos una propiedad auxiliar si existe
          }
          return item[property];
        };

        // Asignamos el ordenador a la tabla
        this.dataSource.sort = this.sort;

        // Definimos un orden inicial después de un pequeño delay
        setTimeout(() => {
          this.sort.active = 'FechaDocumento';
          this.sort.direction = 'desc';
          this.sort.sortChange.emit({
            active: 'FechaDocumento',
            direction: 'desc',
          });
        });

        // Asignamos el paginador
        this.dataSource.paginator = this.paginator;
      },
      // error: si ocurre algún fallo al traer los datos
      error: (error) => console.error('Error al obtener datos:', error),
    });
  }

  // Activa o desactiva la expansión de un ítem (modo responsive móvil)
  toggleExpansion(item: any) {
    // Si el item ya está expandido, lo colapsamos. Si no, lo expandimos.
    this.expandedItem = this.expandedItem === item ? null : item;
  }

  // Aplica filtro a la tabla con lo que escribe el usuario
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Navega a la vista del formulario de entrega con los datos del despacho seleccionado
  delivered(despacho: any): void {
    console.log('ID del despacho (antes de navegar):', despacho);

    // Creamos un objeto `NavigationExtras` que incluye el despacho en el estado
    const extras: NavigationExtras = {
      state: { despacho },
    };

    // Navegamos al formulario de entrega, pasando el estado con los datos
    this.router.navigate(['/delivered-form'], extras);
  }

  // A brir el mapa, que contendra la ubicacion del despacho que se asigna
  abrirMapa(direccion: string): void {
    this.dialog.open(ModalMapComponent, {
      width: '600px',
      data: { direccion },
    });
  }
}
