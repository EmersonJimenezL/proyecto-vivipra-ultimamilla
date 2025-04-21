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

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    const despacho = history.state.despacho;

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

  ngAfterViewInit(): void {
    const canvas = this.signaturePadElement.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = 120;
    this.ctx.strokeStyle = '#ff9800';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    // Eventos de firma (mouse + touch)
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

    // Texto guía inicial
    this.ctx.font = '16px sans-serif';
    this.ctx.fillStyle = '#999';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Firme aquí', canvas.width / 2, canvas.height / 2);
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

    // Volver a dibujar el mensaje de guía
    this.ctx.font = '16px sans-serif';
    this.ctx.fillStyle = '#999';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Firme aquí', canvas.width / 2, canvas.height / 2);
  }

  getSignatureDataURL(): string {
    return this.signaturePadElement.nativeElement.toDataURL();
  }

  onSubmit(): void {
    if (this.deliveredForm.invalid) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const formValue = this.deliveredForm.getRawValue();
    const signature = this.getSignatureDataURL();

    const dataToSend = {
      ...formValue,
      firma: signature,
    };

    this.authService.setDataDistpatch(dataToSend).subscribe({
      next: () => {
        alert('Entrega registrada con éxito ✅');
        this.deliveredForm.reset();
        this.clearSignature();
      },
      error: (err) => {
        console.error('Error al guardar la entrega:', err);
        alert('Error al guardar la entrega');
      },
    });
  }
}
