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
import { LoginComponent } from '../login/login.component';

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

  choferesConDespachos: { chofer: string; despachos: any[] }[] = [];

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargeData();
    this.chargeDespachosActivos();
  }

  chargeData(): void {
    this.authService.getDataDispatch().subscribe({
      next: (despachosMongo) => {
        const entregados = despachosMongo.filter(
          (d: any) => d.estado === 'Entregado'
        );
        this.dataSource = new MatTableDataSource(entregados);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (error) =>
        console.error('Error al obtener datos desde Mongo:', error),
    });
  }

  async chargeDespachosActivos(): Promise<void> {
    try {
      const [todosDespachos, todosUsuarios] = await Promise.all([
        this.authService.getDataDispatch().toPromise(),
        this.authService.getDataUser().toPromise(),
      ]);

      const usuariosChoferes = todosUsuarios
        .filter((u: any) => u.rol === 'chofer')
        .map((u: any) => u.nombreUsuario); // o email según cómo estén almacenados

      const activos = todosDespachos.filter(
        (d: any) =>
          d.estado === 'Despacho' && usuariosChoferes.includes(d.chofer)
      );

      console.log('usuarios choferes', usuariosChoferes);
      console.log('Despachos', activos);

      const agrupados: { [chofer: string]: any[] } = {};
      activos.forEach((despacho: any) => {
        if (!agrupados[despacho.chofer]) agrupados[despacho.chofer] = [];
        agrupados[despacho.chofer].push(despacho);
      });

      this.choferesConDespachos = Object.entries(agrupados).map(
        ([chofer, despachos]) => ({
          chofer,
          despachos,
        })
      );
    } catch (error) {
      console.error('Error al cargar despachos activos o usuarios:', error);
    }
  }

  // Mejora el rendimiento en el *ngFor con trackBy usando el folio
  trackByFolio(index: number, item: any): string {
    return item.folio;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  abrirModalFirma(imagen: string): void {
    this.dialog.open(FirmaModalComponent, {
      data: { imagen },
      width: '600px',
      maxHeight: '90vh',
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  eliminarDespacho(folio: number) {
    this.authService.deleteDispatch(folio).subscribe({
      next: () => {
        this.chargeData();
        this.chargeDespachosActivos();
      },
      error: (err) => console.error('Error al eliminar despacho:', err),
    });
  }
}
