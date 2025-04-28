import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Se una variable con la url de la API conectada con MongoDB
  private endPointMongo = 'http://192.168.200.80:3005/despachos';

  // Se una variable con la url de la vista conectada con SAPHanna
  private endPointView = 'http://192.168.200.80:3000/data/FactDespacho';

  // endpoint encargado de traer la informacion de la tabla de usuarios
  private endPointUser = 'http://192.168.200.80:3000/data/usuario';

  // inyectar el servicio HttpClient en el constructor
  constructor(private http: HttpClient) {}

  // metodo para obtener los datos de la vista creada en SAPHanna
  getData(): Observable<any> {
    return this.http.get(this.endPointView);
  }

  // metodo para inyectar datos a la API conectada con MongoDB
  saveData(data: any): Observable<any> {
    return this.http.post(this.endPointMongo, data);
  }

  // metodo para obtener los datos de la API conectada con MongoDB
  getDataDispatch(): Observable<any> {
    return this.http.get(this.endPointMongo);
  }

  // metodo para actualizar los campos faltantes de la API conectada con MongoDB
  setDataDistpatch(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.endPointMongo}/${id}`, data);
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  // estas fuuncionalidades estaran destinadas al login de la pagina
  login(nombre_usuario: string, contrasenna: string): Observable<any> {
    return this.http.get<any[]>(this.endPointUser).pipe(
      map((usuarios) => {
        const usuarioEncontrado = usuarios.find(
          (u: any) =>
            u.usuario === nombre_usuario && u.contrasenna === contrasenna
        );

        if (usuarioEncontrado) {
          // Guardar sesión manualmente
          localStorage.setItem('token', 'falso-token'); // Un token falso para simular
          localStorage.setItem('rol', usuarioEncontrado.rol);
          localStorage.setItem('userId', usuarioEncontrado.id.toString());
          localStorage.setItem('nombre', usuarioEncontrado.nombre);
          localStorage.setItem('apellido', usuarioEncontrado.apellido);
          return usuarioEncontrado;
        } else {
          throw new Error('Credenciales incorrectas');
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getNombreCompleto(): string {
    const nombre = localStorage.getItem('nombre') || '';
    const apellido = localStorage.getItem('apellido') || '';
    return `${nombre} ${apellido}`;
  }
}
