import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private endPoint = 'http://192.168.200.80:3000/data/FactDespacho';

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get(this.endPoint);
  }

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
