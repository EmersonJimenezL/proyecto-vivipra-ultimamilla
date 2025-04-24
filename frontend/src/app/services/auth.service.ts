import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Se una variable con la url de la API conectada con MongoDB
  private endPointMongo = 'http://192.168.200.80:3005/despachos';

  // Se una variable con la url de la vista conectada con SAPHanna
  private endPointView = 'http://192.168.200.80:3000/data/FactDespacho';

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
