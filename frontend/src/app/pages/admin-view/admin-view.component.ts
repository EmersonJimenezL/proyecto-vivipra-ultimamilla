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
  selector: 'app-admin-view',
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
    CdkTableModule,
  ],
  templateUrl: './admin-view.component.html',
  styleUrl: './admin-view.component.scss',
})
export class AdminViewComponent implements OnInit {
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

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  despachosExistentes: Set<string> = new Set();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargeData();
  }

  chargeData(): void {
    this.authService.getDataDispatch().subscribe({
      next: (despachosMongo) => {
        let despachos = despachosMongo;
        this.dataSource = new MatTableDataSource(despachos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
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

  trackByFolio(index: number, item: any): string {
    return item.folio;
  }

  abrirModalFirma(imagen: string): void {
    this.dialog.open(FirmaModalComponent, {
      data: { imagen },
      width: '600px',
      maxHeight: '90vh',
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
