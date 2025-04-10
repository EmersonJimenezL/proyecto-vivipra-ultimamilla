import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [
    CommonModule,
    ZXingScannerModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss',
})
export class ScanComponent {
  allowedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.PDF_417,
  ];

  scannedCode: string | null = null;
  facturaData: any;
  hasScanned = false;
  devices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;

  loading = true;

  escaneando = false;

  scannedResult: string = '';

  constructor(private http: HttpClient) {}

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.devices = devices;
    if (devices.length > 0) {
      this.selectedDevice = devices[0];
    }
    this.loading = false;
  }

  onCodeResult(result: string) {
    if (this.hasScanned) return;
    this.hasScanned = true;
    this.scannedCode = result;
    this.buscarFactura(result);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(result, 'text/xml');

    const rutEmisor = xmlDoc.getElementsByTagName('RE')[0]?.textContent;
    const tipoDoc = xmlDoc.getElementsByTagName('TD')[0]?.textContent;
    const folio = xmlDoc.getElementsByTagName('F')[0]?.textContent;
    const fechaEmision = xmlDoc.getElementsByTagName('FE')[0]?.textContent;
    const razonSocial = xmlDoc.getElementsByTagName('RS')[0]?.textContent;

    console.log({ rutEmisor, tipoDoc, folio, fechaEmision, razonSocial });
  }

  buscarFactura(codigo: string) {
    this.http.get(`http://localhost:3000/factura/${codigo}`).subscribe({
      next: (res) => (this.facturaData = res),
      error: (err) => {
        console.error('Error al obtener datos:', err);
        this.facturaData = { error: 'No se encontró la factura' };
      },
    });
  }

  reiniciarEscaneo() {
    this.escaneando = true;
    this.hasScanned = false;
    this.facturaData = null;
    this.scannedCode = null;
  }

  cancelarEscaneo() {
    this.escaneando = false;
    this.hasScanned = false;
    this.scannedCode = null;
    this.facturaData = null;
  }
}
