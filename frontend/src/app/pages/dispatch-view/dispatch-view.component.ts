import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';
import { NavigationExtras, Router } from '@angular/router';

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
  ],
  templateUrl: './dispatch-view.component.html',
  styleUrl: './dispatch-view.component.scss',
})
export class DispatchViewComponent implements OnInit {
  displayedColumns: string[] = [
    'folio',
    'rutCliente',
    'nombreCliente',
    'fechaDespacho',
    'horaDespacho',
    'Direccion',
    'estado',
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
    private router: Router
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
    this.authService.getDataDispatch().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);

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

  // funciones para la expansión de filas (responsive)
  toggleExpansion(item: any) {
    this.expandedItem = this.expandedItem === item ? null : item;
  }

  // funciones para la tabla
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // funciones para la entrega
  delivered(despacho: any): void {
    console.log('ID del despacho (antes de navegar):', despacho);

    // FORMA CORRECTA: pasar el state DENTRO de navigate o navigateByUrl
    const extras: NavigationExtras = {
      state: { despacho },
    };

    // Variante 1: navigate
    this.router.navigate(['/delivered-form'], extras);

    // Variante 2: navigateByUrl (equivalente)
    // this.router.navigateByUrl('/delivered-form', extras);
  }
}
