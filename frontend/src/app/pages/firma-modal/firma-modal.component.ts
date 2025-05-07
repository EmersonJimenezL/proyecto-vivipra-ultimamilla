import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-firma-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './firma-modal.component.html',
  styleUrl: './firma-modal.component.scss',
})
export class FirmaModalComponent {
  constructor(
    public dialogRef: MatDialogRef<FirmaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imagen: string }
  ) {}
}
