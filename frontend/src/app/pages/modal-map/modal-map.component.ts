import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
@Component({
  selector: 'app-modal-map',
  standalone: true,
  imports: [MatDialogModule, SafeUrlPipe],
  templateUrl: './modal-map.component.html',
  styleUrl: './modal-map.component.scss',
})
export class ModalMapComponent {
  url =
    'https://www.google.com/maps/embed/v1/place?key=AIzaSyA15X6cgX_IXgIqZRDnM_tjCJ1WGVStHuk&q=';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { direccion: string }) {}
}
