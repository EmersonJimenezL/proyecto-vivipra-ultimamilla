// Importación de decoradores de Angular y módulos necesarios
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { rutValidator } from '../../shared/validators/rut.validator'; // Validador personalizado de RUT

import { AuthService } from '../../services/auth.service'; // Servicio para interactuar con la API

@Component({
  selector: 'app-delivered-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './delivered-form.component.html',
  styleUrls: ['./delivered-form.component.scss'],
})
export class DeliveredFormComponent implements OnInit, AfterViewInit {
  deliveredForm!: FormGroup; // Formulario reactivo para los datos del despacho

  // Referencia al canvas donde se dibuja la firma
  @ViewChild('signaturePad')
  signaturePadElement!: ElementRef<HTMLCanvasElement>;

  // Variables internas para controlar el canvas de la firma
  private ctx!: CanvasRenderingContext2D;
  private drawing = false; // Estado actual: si el usuario está dibujando
  private hasDrawn = false; // Indica si el usuario realmente firmó

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  // Inicializa el formulario y carga datos desde el state
  ngOnInit(): void {
    const despacho = history.state.despacho;
    const id = despacho._id;

    // Se inicializa el formulario con valores predeterminados
    this.deliveredForm = this.fb.group({
      folio: [despacho?.folio || '', Validators.required],
      rutCliente: [despacho?.rutCliente || '', Validators.required],
      nombreCliente: [despacho?.nombreCliente || '', Validators.required],
      direccion: [despacho?.direccion || '', Validators.required],
      comentario: [despacho?.comentarioDespacho || ''],
      rutEntrega: ['', [Validators.required, rutValidator]], // Valida RUT
      nombreEntrega: ['', Validators.required],
      comentarioEntrega: [''],
    });
  }

  // Configura el canvas para capturar la firma una vez renderizado
  ngAfterViewInit(): void {
    const canvas = this.signaturePadElement.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = 120;

    // Estilos del trazo
    this.ctx.strokeStyle = '#ff9800';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    canvas.style.touchAction = 'none'; // Previene scroll mientras se dibuja

    // Eventos para ratón y pantalla táctil
    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.finishDrawing.bind(this));
    canvas.addEventListener('mouseleave', this.finishDrawing.bind(this));
    canvas.addEventListener('touchstart', this.startDrawing.bind(this), {
      passive: false,
    });
    canvas.addEventListener('touchmove', this.draw.bind(this), {
      passive: false,
    });
    canvas.addEventListener('touchend', this.finishDrawing.bind(this));

    // Muestra texto de guía "Firme aquí"
    this.drawGuideText();
  }

  // Obtiene la posición del evento (mouse o touch) relativa al canvas
  private getPosition(event: MouseEvent | TouchEvent): {
    x: number;
    y: number;
  } {
    const rect = this.signaturePadElement.nativeElement.getBoundingClientRect();
    let clientX: number, clientY: number;

    if (event instanceof TouchEvent) {
      clientX = event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX;
      clientY = event.touches[0]?.clientY ?? event.changedTouches[0]?.clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // Inicia el dibujo
  startDrawing(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.drawing = true;
    this.hasDrawn = true;
    const { x, y } = this.getPosition(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  // Dibuja la línea mientras el mouse o dedo se mueve
  draw(event: MouseEvent | TouchEvent): void {
    if (!this.drawing) return;
    event.preventDefault();
    const { x, y } = this.getPosition(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  // Termina el trazo
  finishDrawing(): void {
    this.drawing = false;
  }

  // Limpia la firma y reinicia guía
  clearSignature(): void {
    const canvas = this.signaturePadElement.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawGuideText();
    this.hasDrawn = false;
  }

  // Dibuja el texto de "Firme aquí" en el centro
  private drawGuideText(): void {
    this.ctx.font = '16px sans-serif';
    this.ctx.fillStyle = '#999';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Firme aquí',
      this.signaturePadElement.nativeElement.width / 2,
      70
    );
  }

  // Convierte el contenido del canvas a una imagen (Base64)
  getSignatureDataURL(): string {
    return this.signaturePadElement.nativeElement.toDataURL();
  }

  // Lógica de envío del formulario
  onSubmit(): void {
    const { _id } = history.state.despacho;

    if (this.deliveredForm.invalid) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (!this.hasDrawn) {
      alert('Por favor, firme antes de enviar.');
      return;
    }

    // Obtiene los valores del formulario
    const formValue = this.deliveredForm.getRawValue();
    const { rutEntrega, nombreEntrega, comentarioEntrega } = formValue;

    // Obtiene la firma del canvas y la patente desde el localStorage
    const signature = this.getSignatureDataURL();
    const patente = localStorage.getItem('patente') || '';

    // Cuerpo del objeto a enviar
    const dataToSend = {
      estado: 'Entregado', // Cambia el estado del despacho
      rutEntrega,
      nombreEntrega,
      comentarioEntrega,
      imagenEntrega: signature, // Firma como imagen base64
      patente,
    };

    // Envia los datos al backend
    this.authService.setDataDispatchDelivered(_id, dataToSend).subscribe({
      next: () => {
        alert('Entrega registrada con éxito');
        this.deliveredForm.reset();
        this.clearSignature(); // Limpia firma
        this.router.navigate(['/despachos']); // Redirige al listado
      },
      error: (err) => {
        console.error('Error al guardar la entrega:', err);
        alert('Error al guardar la entrega');
      },
    });
  }

  // Cierra sesión del usuario
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  formatearRutEntrega(): void {
    let rut: string = this.deliveredForm.get('rutEntrega')?.value || '';

    // Elimina todo lo que no sea número o letra K/k
    rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();

    // Limita a máximo 9 números + 1 DV
    rut = rut.slice(0, 9);

    if (rut.length < 2) return;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    // Formatea el cuerpo con puntos
    let cuerpoFormateado = '';
    let c = cuerpo;
    while (c.length > 3) {
      cuerpoFormateado = '.' + c.slice(-3) + cuerpoFormateado;
      c = c.slice(0, -3);
    }
    cuerpoFormateado = c + cuerpoFormateado;

    const rutFormateado = `${cuerpoFormateado}-${dv}`;

    this.deliveredForm.get('rutEntrega')?.setValue(rutFormateado, {
      emitEvent: false,
    });
  }
}
