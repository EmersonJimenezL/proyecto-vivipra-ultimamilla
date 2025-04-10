import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss',
})
export class ScanComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  logout() {
    this.authService.logout();
    this.snackBar.open('Sesión cerrada con éxito.', 'Ok', {
      duration: 2500,
      panelClass: ['snackbar-info'],
    });
    this.router.navigate(['/login']);
  }
}
