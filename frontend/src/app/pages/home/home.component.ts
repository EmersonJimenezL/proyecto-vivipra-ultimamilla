import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  // creamos dentro del constructor una variable de tipo router, lo que nos permitira manejar
  // las direntenes funcionalidades que tiene el modulo Router
  constructor(private router: Router) {}

  ngOnInit() {
    //configuramos un timeout para que la pagina se recargue durante un tiempo
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000); //redirige a la pagina del login luego de 3s de espera
  }
}
