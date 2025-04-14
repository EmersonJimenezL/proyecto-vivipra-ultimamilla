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
  ],
  templateUrl: './available-view.component.html',
  styleUrl: './available-view.component.scss',
})
export class AvailableViewComponent implements OnInit {
  // definición de las columnas que se mostrarán en la tabla.
  displayedColumns: string[] = [
    'select',
    'FolioNum',
    'CodCliente',
    'NombreCliente',
    'FechaDocumento',
    'HoraCreacion',
    'Articulo',
    'Cantidad',
  ];

  // dataSource, instancia de MatTableDataSource, clase de Angular Material, permite manejar los datos de la tabla
  // y proporciona funcionalidades como paginación, filtrado y ordenamiento.
  // La propiedad dataSource es un arreglo de objetos que representan los datos que se mostrarán en la tabla.
  // En este caso, se inicializa como un arreglo vacío.
  // su funcionalidad es permitir la paginación y el filtrado de los datos en la tabla.
  // con la intencion de que la tabla sea más fácil de usar y navegar.
  dataSource = new MatTableDataSource<any>([]);

  // selection es una instancia de SelectionModel, que permite manejar la selección de filas en la tabla.
  // En este caso, se inicializa como un arreglo vacío.
  // su funcionalidad es permitir seleccionar varias filas a la vez, lo que es útil para realizar acciones en grupo.
  // con la intencion de que el usuario pueda seleccionar varias filas a la vez y realizar acciones en grupo.
  selection = new SelectionModel<any>(true, []);

  // paginator es una referencia a un componente de paginación de Angular Material.
  // Se utiliza para manejar la paginación de la tabla, se inicializa como un objeto de tipo MatPaginator.
  // su funcionalidad es permitir la paginación de los datos en la tabla, lo que es útil para manejar grandes cantidades de datos.
  // con la intencion de que la tabla sea más fácil de usar y navegar.
  // el decorador @ViewChild se utiliza para obtener una referencia al componente de paginación en el template.
  // Esto permite acceder a la instancia del componente de paginación y configurarlo desde el componente de TypeScript.
  // su funcionalidad es permitir la paginación de los datos en la tabla, lo que es útil para manejar grandes cantidades de datos.
  // con la intencion de que la tabla sea más fácil de usar y navegar.
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Se inyecta el servicio AuthService en el constructor del componente.
  // Esto permite acceder a los métodos y propiedades del servicio desde el componente.
  constructor(private authService: AuthService) {}

  //ngOnInit es un ciclo de vida de Angular que se ejecuta una vez que el componente ha sido inicializado.
  // En este caso, se utiliza para obtener los datos de la API y asignarlos a la propiedad dataSource de la tabla.
  // Se utiliza el servicio AuthService para hacer la llamada a la API y obtener los datos.
  // Se utiliza el método subscribe para manejar la respuesta de la API.
  // next es una función que se ejecuta cuando la llamada a la API es exitosa y recibe los datos como parámetro.
  // error es una función que se ejecuta cuando la llamada a la API falla y recibe el error como parámetro.
  ngOnInit(): void {
    this.authService.getData().subscribe({
      next: (data) => {
        data.forEach((item: any) => {
          // Convertir FechaDocumento a Date
          const fecha = new Date(item.FechaDocumento);

          // Asegurarse que HoraCreacion tenga 6 dígitos
          const padded = item.HoraCreacion.toString().padStart(6, '0');
          const horas = parseInt(padded.substring(0, 2), 10);
          const minutos = parseInt(padded.substring(2, 4), 10);
          const segundos = parseInt(padded.substring(4, 6), 10);

          // Combinar fecha + hora correctamente
          fecha.setHours(horas);
          fecha.setMinutes(minutos);
          fecha.setSeconds(segundos);

          // Guardar como propiedad auxiliar para ordenar
          item._fechaHoraCompleta = fecha;
        });

        this.dataSource = new MatTableDataSource(data);

        // Ordenar por la propiedad auxiliar
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

  // Este método se utiliza para aplicar un filtro a los datos de la tabla.
  // la funcion recibe un evento como parámetro, que contiene el valor del campo de búsqueda.
  // event.target es el elemento HTML que desencadenó el evento.
  // htmlInputElement es una interfaz que representa un elemento de entrada HTML.
  // Se utiliza el operador as para indicar que event.target es un elemento de entrada HTML.
  // El valor se convierte a minúsculas y se utiliza para filtrar los datos de la tabla.
  // Se utiliza el método filter de MatTableDataSource para aplicar el filtro.
  // su funcionalidad es permitir al usuario buscar datos en la tabla de manera más fácil y rápida.
  // con la intencion de que el usuario pueda encontrar rápidamente los datos que está buscando.
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Este método se utiliza para formatear la hora en un formato legible.
  // Se utiliza el método padStart para asegurarse de que la hora tenga 6 dígitos.
  // Se utiliza el método parseInt para convertir la hora a un número entero.
  // Se utiliza el método substring para extraer las horas, minutos y segundos de la cadena de texto.
  // Se utiliza el operador ternario para determinar si se debe eliminar el cero inicial de la hora.
  // su funcionalidad es permitir al usuario ver la hora en un formato legible.
  // con la intencion de que el usuario pueda ver la hora en un formato legible y fácil de entender.
  // Se utiliza el método toString para convertir la hora a una cadena de texto.
  formatTime(time: string): string {
    if (!time) return '';

    // Convertir a string si es número
    const timeString = time.toString();

    // Asegurarse de que tenga 6 dígitos (añadir ceros a la izquierda si es necesario)
    const paddedTime = timeString.padStart(6, '0');

    // Extraer horas, minutos y segundos
    let hours = parseInt(paddedTime.substring(0, 2), 10);
    const minutes = paddedTime.substring(2, 4);
    const seconds = paddedTime.substring(4, 6);

    // Eliminar el cero inicial de la hora si es menor que 10
    const formattedHours = hours < 10 ? hours.toString() : hours.toString();

    return `${hours}:${minutes}:${seconds}`;
  }

  // Este método se utiliza para determinar si todas las filas de la tabla están seleccionadas.
  // Se utiliza la propiedad selected de SelectionModel para obtener el número de filas seleccionadas y el número total de filas.
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  // Este método se utiliza para seleccionar o deseleccionar todas las filas de la tabla.
  // Se utiliza el método select de SelectionModel para seleccionar o deseleccionar todas las filas.
  // Se utiliza el operador ternario para determinar si se deben seleccionar o deseleccionar las filas.
  // su funcionalidad es permitir al usuario seleccionar o deseleccionar todas las filas de la tabla de manera más fácil y rápida.
  // con la intention de que el usuario pueda seleccionar o deseleccionar todas las filas de la tabla de manera más fácil y rápida.
  toggleAllRows(event: any) {
    event.checked
      ? this.selection.select(...this.dataSource.data)
      : this.selection.clear();
  }

  // Este método se utiliza para seleccionar o deseleccionar una fila de la tabla.
  // Se utiliza el método toggle de SelectionModel para seleccionar o deseleccionar la fila.

  toggleRow(row: any) {
    this.selection.toggle(row);
  }

  // Este método se utiliza para agregar las filas seleccionadas a un despacho.
  // Se utiliza el método selected de SelectionModel para obtener las filas seleccionadas.
  // Utiliza map para crear un nuevo arreglo con los datos de las filas seleccionadas y para añadir los datos adicionales
  // Se utiliza el método saveData del servicio AuthService para enviar los datos al servidor.
  addToDispatch() {
    const selected = this.selection.selected;

    const hoy = new Date();
    const fechaFormateada = `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`; // yyyy-MM-dd

    const horaFormateada = `${hoy.getHours().toString().padStart(2, '0')}:${hoy
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${hoy.getSeconds().toString().padStart(2, '0')}`;

    selected.forEach((item) => {
      const payload = {
        folio: item.FolioNum,
        fechaDespacho: fechaFormateada,
        horaDespacho: horaFormateada,
        nombreCliente: item.NombreCliente,
        rutCliente: item['Cod.Cliente'],
        articulos: [
          {
            codigo: item.Articulo,
            nombre: item.Descripcion || 'No definido',
            cantidad: item.Cantidad,
          },
        ],
        estado: 'Despacho',
      };

      console.log('📦 Enviando payload:', payload);

      this.authService.saveData(payload).subscribe({
        next: () => alert('Despacho creado correctamente'),
        error: (err) => console.error('Error al guardar despacho:', err),
      });
    });
  }
}
