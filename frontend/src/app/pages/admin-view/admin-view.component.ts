// Importaciones necesarias desde Angular, Angular Material y módulos del proyecto
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
import { SharedModule } from '../../shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FirmaModalComponent } from '../firma-modal/firma-modal.component';
import { CdkTableModule } from '@angular/cdk/table';

@Component({
  selector: 'app-admin-view', // Selector del componente
  standalone: true, // Componente independiente
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
    CdkTableModule,
  ],
  templateUrl: './admin-view.component.html', // Vista HTML del componente
  styleUrl: './admin-view.component.scss', // Estilos CSS del componente
})
export class AdminViewComponent implements OnInit {
  // Columnas visibles de la tabla
  displayedColumns: string[] = [
    'folio',
    'rutCliente',
    'nombreCliente',
    'tipoEntrega',
    'rutEntrega',
    'nombreEntrega',
    'chofer',
    'patente',
    'asignadoPor',
    'fechaAsignacion',
    'horaAsignacion',
    'fechaDespacho',
    'horaDespacho',
    'fechaEntrega',
    'horaEntrega',
    'comentarioEntrega',
    'imagenEntrega',
  ];

  dataSource = new MatTableDataSource<any>([]); // Fuente de datos de la tabla
  selection = new SelectionModel<any>(true, []); // Permite selección múltiple en la tabla
  despachosExistentes: Set<string> = new Set(); // Set para evitar duplicados (si se usa)

  // Referencias a paginador y ordenamiento de la tabla
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService, // Servicio para obtener datos del backend
    private dialog: MatDialog, // Servicio para abrir diálogos (modales)
    private router: Router // Navegación entre vistas
  ) {}

  ngOnInit(): void {
    this.chargeData(); // Carga los datos al iniciar
  }

  // Método para obtener los datos de despachos desde el backend
  chargeData(): void {
    this.authService.getDataDispatch().subscribe({
      next: (despachosMongo) => {
        let despachos = despachosMongo;
        this.dataSource = new MatTableDataSource(despachos); // Se asignan los datos
        this.dataSource.sort = this.sort; // Habilita ordenamiento
        this.dataSource.paginator = this.paginator; // Habilita paginación
      },
      error: (error) =>
        console.error('Error al obtener datos desde Mongo:', error),
    });
  }

  // Aplica filtro de texto a la tabla (por cualquier campo visible)
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase(); // Normaliza el texto
  }

  // Verifica si todas las filas visibles están seleccionadas
  isAllSelected() {
    const filteredData = this.dataSource.filteredData;
    return (
      this.selection.selected.length > 0 &&
      filteredData.every((row) => this.selection.isSelected(row))
    );
  }

  // Selecciona o deselecciona todas las filas filtradas
  toggleAllRows(event: any) {
    const filteredData = this.dataSource.filteredData;
    if (event.checked) {
      this.selection.select(...filteredData); // Selecciona todas
    } else {
      this.selection.deselect(...filteredData); // Deselecciona todas
    }
  }

  // Alterna la selección de una fila individual
  toggleRow(row: any) {
    this.selection.toggle(row);
  }

  // Mejora el rendimiento en el *ngFor con trackBy usando el folio
  trackByFolio(index: number, item: any): string {
    return item.folio;
  }

  // Abre el modal para visualizar la firma (imagenEntrega)
  abrirModalFirma(imagen: string): void {
    this.dialog.open(FirmaModalComponent, {
      data: { imagen },
      width: '600px',
      maxHeight: '90vh',
    });
  }

  // Cierra sesión y limpia el almacenamiento local
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.clear(); // Limpieza general por seguridad
    this.router.navigate(['/login']); // Redirige al login
  }
}
