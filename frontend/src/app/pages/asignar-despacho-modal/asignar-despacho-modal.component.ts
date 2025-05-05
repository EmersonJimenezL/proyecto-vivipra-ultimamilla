import { Component, Inject } from '@angular/core';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-asignar-despacho-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './asignar-despacho-modal.component.html',
  styleUrls: ['./asignar-despacho-modal.component.scss'],
})
export class AsignarDespachoModalComponent {
  constructor(
    public dialogRef: MatDialogRef<AsignarDespachoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { folio: string }
  ) {}

  seleccionar(tipo: string) {
    this.dialogRef.close(tipo);
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
