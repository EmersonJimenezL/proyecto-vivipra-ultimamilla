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

import { AuthService } from '../../services/auth.service';

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
  deliveredForm!: FormGroup;

  @ViewChild('signaturePad')
  signaturePadElement!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private hasDrawn = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const despacho = history.state.despacho;
    const id = despacho._id;

    this.deliveredForm = this.fb.group({
      folio: [despacho?.folio || '', Validators.required],
      rutCliente: [despacho?.rutCliente || '', Validators.required],
      nombreCliente: [despacho?.nombreCliente || '', Validators.required],
      direccion: [despacho?.direccion || '', Validators.required],
      comentario: [despacho?.comentarioDespacho || ''],
      rutEntrega: ['', Validators.required],
      nombreEntrega: ['', Validators.required],
      comentarioEntrega: [''],
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.signaturePadElement.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = 120;
    this.ctx.strokeStyle = '#ff9800';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    canvas.style.touchAction = 'none';

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

    this.drawGuideText();
  }

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

  startDrawing(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.drawing = true;
    this.hasDrawn = true;
    const { x, y } = this.getPosition(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.drawing) return;
    event.preventDefault();
    const { x, y } = this.getPosition(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  finishDrawing(): void {
    this.drawing = false;
  }

  clearSignature(): void {
    const canvas = this.signaturePadElement.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawGuideText();
    this.hasDrawn = false;
  }

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

  getSignatureDataURL(): string {
    return this.signaturePadElement.nativeElement.toDataURL();
  }

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

    const formValue = this.deliveredForm.getRawValue();
    const { rutEntrega, nombreEntrega, comentarioEntrega } = formValue;

    const signature = this.getSignatureDataURL();
    const patente = localStorage.getItem('patente') || '';

    const dataToSend = {
      estado: 'Entregado', // aquí sí se cambia el estado
      rutEntrega,
      nombreEntrega,
      comentarioEntrega,
      imagenEntrega: signature,
      patente,
    };

    this.authService.setDataDispatchDelivered(_id, dataToSend).subscribe({
      next: () => {
        alert('Entrega registrada con éxito');
        this.deliveredForm.reset();
        this.clearSignature();
        this.router.navigate(['/despachos']);
      },
      error: (err) => {
        console.error('Error al guardar la entrega:', err);
        alert('Error al guardar la entrega');
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
