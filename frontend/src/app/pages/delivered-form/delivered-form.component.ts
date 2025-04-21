// Importación de decoradores y herramientas de Angular core
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';

// Importación del sistema de formularios reactivos
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

// Módulos visuales de Angular Material para el formulario
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Servicio personalizado para guardar datos
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-delivered-form', // Nombre del componente (selector en HTML)
  standalone: true, // Componente autónomo, no requiere declaración en NgModule
  imports: [
    // Módulos necesarios para el formulario
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './delivered-form.component.html', // Archivo HTML asociado
  styleUrls: ['./delivered-form.component.scss'], // Estilos asociados
})
export class DeliveredFormComponent implements OnInit, AfterViewInit {
  // Declaración del formulario reactivo (se inicializa en ngOnInit)
  deliveredForm!: FormGroup;

  // `@ViewChild` accede al elemento canvas del DOM con la referencia local #signaturePad
  @ViewChild('signaturePad')
  signaturePadElement!: ElementRef<HTMLCanvasElement>;

  // Contexto de dibujo del canvas (2D)
  private ctx!: CanvasRenderingContext2D;

  // Booleano para indicar si se está dibujando o no
  private drawing = false;

  // Constructor con inyección de dependencias: FormBuilder y servicio AuthService
  constructor(private fb: FormBuilder, private authService: AuthService) {}

  // Método de ciclo de vida que se ejecuta al inicializar el componente
  ngOnInit(): void {
    // Obtenemos el objeto `despacho` desde el estado de navegación
    const despacho = history.state.despacho;

    // Creamos el formulario reactivo con los campos necesarios
    this.deliveredForm = this.fb.group({
      folio: [despacho?.folio || '', Validators.required],
      rutCliente: [despacho?.rutCliente || '', Validators.required],
      nombreCliente: [despacho?.nombreCliente || '', Validators.required],
      direccion: [despacho?.direccion || '', Validators.required],
      comentario: [despacho?.comentario || ''],
      rutEntrega: ['', Validators.required],
      nombreEntrega: ['', Validators.required],
      comentarioEntrega: [''],
    });
  }

  // Método que se ejecuta cuando el componente y su vista ya están renderizados
  ngAfterViewInit(): void {
    // Accedemos al elemento canvas
    const canvas = this.signaturePadElement.nativeElement;

    // Obtenemos el contexto 2D para dibujar
    this.ctx = canvas.getContext('2d')!;

    // Configuramos el tamaño del canvas y estilos de línea
    canvas.width = canvas.offsetWidth;
    canvas.height = 120;
    this.ctx.strokeStyle = '#ff9800'; // Color naranja
    this.ctx.lineWidth = 2; // Grosor de la línea
    this.ctx.lineCap = 'round'; // Bordes redondeados

    // Desactiva el scroll en dispositivos táctiles sobre el canvas
    canvas.style.touchAction = 'none';

    // Eventos para manejar la firma (mouse y touch)
    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.finishDrawing.bind(this));
    canvas.addEventListener('mouseleave', this.finishDrawing.bind(this));
    canvas.addEventListener('touchstart', this.startDrawing.bind(this), {
      passive: false, // Necesario para prevenir el scroll
    });
    canvas.addEventListener('touchmove', this.draw.bind(this), {
      passive: false,
    });
    canvas.addEventListener('touchend', this.finishDrawing.bind(this));

    // Mensaje guía inicial dentro del canvas
    this.ctx.font = '16px sans-serif';
    this.ctx.fillStyle = '#999';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Firme aquí', canvas.width / 2, canvas.height / 2);
  }

  // Calcula la posición del cursor o dedo sobre el canvas
  private getPosition(event: MouseEvent | TouchEvent): {
    x: number;
    y: number;
  } {
    const rect = this.signaturePadElement.nativeElement.getBoundingClientRect();

    let clientX: number, clientY: number;

    // Si el evento es táctil, usamos las coordenadas del primer toque
    if (event instanceof TouchEvent) {
      clientX = event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX;
      clientY = event.touches[0]?.clientY ?? event.changedTouches[0]?.clientY;
    } else {
      // Si es con mouse, tomamos directamente las coordenadas
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Ajustamos las coordenadas relativas al canvas
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // Comienza el dibujo al presionar o tocar el canvas
  startDrawing(event: MouseEvent | TouchEvent): void {
    event.preventDefault(); // Evita el scroll o comportamiento por defecto
    this.drawing = true;

    const { x, y } = this.getPosition(event);
    this.ctx.beginPath(); // Comienza un nuevo trazo
    this.ctx.moveTo(x, y); // Mueve el "lápiz" al punto inicial
  }

  // Dibuja la línea mientras se mueve el mouse o el dedo
  draw(event: MouseEvent | TouchEvent): void {
    if (!this.drawing) return; // Solo dibuja si se activó el dibujo
    event.preventDefault();

    const { x, y } = this.getPosition(event);
    this.ctx.lineTo(x, y); // Dibuja línea desde el punto anterior al nuevo
    this.ctx.stroke(); // Aplica el trazo
  }

  // Finaliza el dibujo cuando se suelta el mouse o se levanta el dedo
  finishDrawing(): void {
    this.drawing = false;
  }

  // Limpia el canvas (firma) y vuelve a mostrar el mensaje guía
  clearSignature(): void {
    const canvas = this.signaturePadElement.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.font = '16px sans-serif';
    this.ctx.fillStyle = '#999';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Firme aquí', canvas.width / 2, canvas.height / 2);
  }

  // Retorna la firma dibujada como una imagen en base64 (data URL)
  getSignatureDataURL(): string {
    return this.signaturePadElement.nativeElement.toDataURL();
  }

  // Se ejecuta al enviar el formulario (botón guardar entrega)
  onSubmit(): void {
    // Si el formulario es inválido, mostramos alerta y detenemos el envío
    if (this.deliveredForm.invalid) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    // Obtenemos los datos del formulario
    const formValue = this.deliveredForm.getRawValue();

    // Obtenemos la firma como imagen base64
    const signature = this.getSignatureDataURL();

    // Combinamos ambos datos para enviarlos al backend
    const dataToSend = {
      ...formValue,
      firma: signature,
    };

    // Enviamos los datos usando el servicio
    this.authService.setDataDistpatch(dataToSend).subscribe({
      next: () => {
        // Si todo sale bien, limpiamos el formulario y la firma
        alert('Entrega registrada con éxito ✅');
        this.deliveredForm.reset();
        this.clearSignature();
      },
      error: (err) => {
        // Si ocurre un error, lo mostramos en consola y alertamos al usuario
        console.error('Error al guardar la entrega:', err);
        alert('Error al guardar la entrega');
      },
    });
  }
}
