// Importación de decoradores y módulos desde Angular core y Angular Material
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

// Decorador que define un componente Angular
@Component({
  selector: 'app-available-view', // Selector para usar el componente en HTML
  standalone: true, // Indica que este componente es autónomo, no necesita declararse en un módulo
  imports: [
    // Módulos que este componente importa para su funcionamiento
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
  templateUrl: './available-view.component.html', // Ruta al archivo de plantilla HTML
  styleUrl: './available-view.component.scss', // Ruta a los estilos del componente
})
export class AvailableViewComponent implements OnInit {
  // Lista de columnas que se mostrarán en la tabla
  displayedColumns: string[] = [
    'select', // Checkbox de selección
    'FolioNum', // Número de folio
    'CodCliente', // Código/RUT del cliente
    'NombreCliente', // Nombre del cliente
    'FechaDocumento', // Fecha de la factura
    'HoraCreacion', // Hora de creación del documento
    'Direccion', // Dirección del cliente
    'Comentarios', // Comentarios asociados
  ];

  // Fuente de datos de la tabla, tipo MatTableDataSource
  // Permite aplicar paginación, ordenamiento, filtrado, etc.
  dataSource = new MatTableDataSource<any>([]);

  // Modelo de selección para manejar qué filas están seleccionadas
  // El `true` permite seleccionar múltiples filas al mismo tiempo
  selection = new SelectionModel<any>(true, []);

  // Set que almacena los folios que ya han sido despachados
  // Se usa para evitar volver a mostrarlos o duplicarlos
  despachosExistentes: Set<string> = new Set();

  // Referencias a los componentes paginator y sort
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Inyección del servicio AuthService, que maneja llamadas a la API
  constructor(private authService: AuthService) {}

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    this.chargeData(); // Llama a la función que carga los datos
  }

  // Método que obtiene los despachos y luego carga la vista
  // Carga tanto la vista como los despachos de Mongo y filtra los repetidos
  chargeData(): void {
    // Paso 1: Obtener los datos de despachos desde Mongo
    this.authService.getDataDispatch().subscribe({
      next: (despachosMongo) => {
        // Paso 2: Crear Set de folios válidos convertidos a número
        const foliosDespachados = new Set(
          despachosMongo
            .map((d: any) => Number(d.folio)) // Convertimos a número
            .filter((folio: number) => !isNaN(folio)) // Solo válidos
        );

        console.log('Folios válidos desde Mongo (despachados):', [
          ...foliosDespachados,
        ]);

        // Paso 3: Obtener los datos desde la vista de SAP
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

            // Paso 4: Filtrar datos que NO están en la lista de folios ya despachados
            const datosFiltrados = dataVista.filter(
              (item: any) => !foliosDespachados.has(Number(item.FolioNum))
            );

            console.log(
              'Datos visibles (filtrados):',
              datosFiltrados.map((d: any) => d.FolioNum)
            );

            // Paso 5: Asignar a la tabla
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

  // Obtiene los datos desde la API y los prepara para mostrarlos en tabla
  getDataView(): void {
    this.authService.getData().subscribe({
      next: (data) => {
        // Procesamos cada ítem de los datos recibidos
        data.forEach((item: any) => {
          // Convertimos el campo FechaDocumento a un objeto Date
          const fecha = new Date(item.FechaDocumento);

          // Nos aseguramos que HoraCreacion tenga 6 dígitos (ej. 90015 → 090015)
          const padded = item.HoraCreacion.toString().padStart(6, '0');

          // Extraemos hora, minutos y segundos
          const horas = parseInt(padded.substring(0, 2), 10);
          const minutos = parseInt(padded.substring(2, 4), 10);
          const segundos = parseInt(padded.substring(4, 6), 10);

          // Asignamos la hora completa a la fecha
          fecha.setHours(horas, minutos, segundos);

          // Creamos una propiedad auxiliar para ordenar por fecha+hora
          item._fechaHoraCompleta = fecha;

          // Imprime en consola todos los datos con su nueva propiedad
          // console.log(data);
        });

        // Filtramos los datos para mostrar solo los que NO están en despachos
        const datosFiltrados = data.filter(
          (item: any) => !this.despachosExistentes.has(item.FolioNum)
        );

        // Asignamos los datos filtrados a la tabla
        this.dataSource = new MatTableDataSource(datosFiltrados);

        // Configuramos el ordenamiento para usar _fechaHoraCompleta en la columna FechaDocumento
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property === 'FechaDocumento') {
            return item._fechaHoraCompleta;
          }
          return item[property];
        };

        // Asignamos el objeto sort a la tabla
        this.dataSource.sort = this.sort;

        // Después de un pequeño delay, activamos el orden descendente por FechaDocumento
        setTimeout(() => {
          this.sort.active = 'FechaDocumento';
          this.sort.direction = 'desc';
          this.sort.sortChange.emit({
            active: 'FechaDocumento',
            direction: 'desc',
          });
        });

        // Asignamos el paginador a la tabla
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => console.error('Error al obtener datos:', error),
    });
  }

  // Filtra la tabla en tiempo real según el texto ingresado por el usuario
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Verifica si todos los elementos visibles están seleccionados
  isAllSelected() {
    const filteredData = this.dataSource.filteredData;
    return (
      this.selection.selected.length > 0 &&
      filteredData.every((row) => this.selection.isSelected(row))
    );
  }

  // Selecciona o deselecciona todas las filas visibles en la tabla
  toggleAllRows(event: any) {
    const filteredData = this.dataSource.filteredData;

    // `event.checked` es true si el checkbox "seleccionar todos" está marcado
    if (event.checked) {
      this.selection.select(...filteredData);
    } else {
      this.selection.deselect(...filteredData);
    }
  }

  // Alterna la selección de una fila (marca o desmarca)
  toggleRow(row: any) {
    this.selection.toggle(row);
  }

  // Envía las filas seleccionadas al backend como nuevos despachos
  async addToDispatch() {
    const selected = this.selection.selected;
    if (selected.length === 0) return;

    // Obtenemos la fecha y hora actual en formato legible
    const hoy = new Date();
    const fechaFormateada = `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    const horaFormateada = `${hoy.getHours().toString().padStart(2, '0')}:${hoy
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${hoy.getSeconds().toString().padStart(2, '0')}`;

    // Creamos un array para guardar todas las solicitudes al backend
    const requests: any[] = [];

    selected.forEach((item) => {
      // Creamos el cuerpo (payload) de la solicitud
      const payload = {
        folio: item.FolioNum,
        nombreCliente: item.NombreCliente,
        rutCliente: item['Cod.Cliente'],
        estado: 'Despacho',
        direccion: item.Direccion,
        horaAsignacion: horaFormateada,
        fechaAsignacion: fechaFormateada,
        // comentarios: item.Comentarios,
        tipoEntrega: 'RM',
        chofer: 'Tralalero Tralala',
        patente: 'xxxxxx',
        asignadoPor: 'bombardiro crocodilo',
      };

      console.log('Enviando payload:', payload);

      // Guardamos la promesa para luego ejecutarlas todas juntas
      requests.push(firstValueFrom(this.authService.saveData(payload)));
    });

    try {
      // Promise.all ejecuta todas las promesas al mismo tiempo y espera que todas terminen
      // Si alguna falla, cae al bloque catch
      await Promise.all(requests);

      alert('Despachos creados correctamente');

      // Marcamos los folios como despachados para no volver a mostrarlos
      selected.forEach((item) => {
        this.despachosExistentes.add(item.FolioNum);
      });

      // Quitamos la selección
      this.selection.clear();

      // Filtramos la tabla para ocultar los ya despachados
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
