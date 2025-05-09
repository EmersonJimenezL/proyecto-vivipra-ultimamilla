// Servicio para comunicación entre componentes sobre la asignación de rutas
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RutaAsignacionService {
  private asignacionIniciadaSubject = new BehaviorSubject<boolean>(false);
  asignacionIniciada$ = this.asignacionIniciadaSubject.asObservable();

  emitirAsignacionIniciada() {
    this.asignacionIniciadaSubject.next(true);
  }

  reset() {
    this.asignacionIniciadaSubject.next(false);
  }
}
