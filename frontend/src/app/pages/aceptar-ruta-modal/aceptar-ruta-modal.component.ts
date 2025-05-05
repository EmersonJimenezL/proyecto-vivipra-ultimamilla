import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aceptar-ruta-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './aceptar-ruta-modal.component.html',
  styleUrls: ['./aceptar-ruta-modal.component.scss'],
})
export class AceptarRutaModalComponent implements OnInit {
  patente: string = '';

  constructor(
    private dialogRef: MatDialogRef<AceptarRutaModalComponent>,
    private autServices: AuthService
  ) {}

  ngOnInit(): void {
    this.autServices.setDataDistpatch(0, '');
  }

  onAccept() {
    this.dialogRef.close(this.patente);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
