import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Se define el endpoint, en la cual inyectaremos los datos obtenidos desde el endpointget junto con los datos modificados
  private endPointPost = 'http://192.168.200.80:3005/despachos';

  // Se define el endpoint para obtener los datos de la API
  private endPointGet = 'http://192.168.200.80:3000/data/FactDespacho';

  // inyectar el servicio HttpClient en el constructor
  constructor(private http: HttpClient) {}

  // método para obtener los datos de la API, con este mismo metodo y la implementacion de la tala que nos brinda angular material
  // podemos crear la vista que nos trae todos los datos de la API y ademas implementar un buscador y paginacion
  getData(): Observable<any> {
    return this.http.get(this.endPointGet);
  }

  // método para enviar datos a la API, este método se utiliza para enviar los datos modificados desde la tabla a la API
  // Se utiliza el método post de HttpClient para enviar los datos al endpoint definido en endPointPost
  saveData(data: any): Observable<any> {
    return this.http.post(this.endPointPost, data);
  }

  // metodo para obtener los datos de la api que se utilizo para obtener los datos de las facturas
  // esta otra api recibe informacion inyectada desde el endpoint get y la envia al endpoint post
  getDataDispatch(): Observable<any> {
    return this.http.get(this.endPointPost);
  }

  // estas fuuncionalidades estaran destinadas al login de la pagina
  // #######################################################################
  // #######################################################################
  // #######################################################################
  // login(nombre_usuario: string, contrasenna: string): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/login`).pipe(
  //     tap((res: any) => {
  //       if (res.token) {
  //         localStorage.setItem('token', res.token);
  //       }
  //     })
  //   );
  // }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
