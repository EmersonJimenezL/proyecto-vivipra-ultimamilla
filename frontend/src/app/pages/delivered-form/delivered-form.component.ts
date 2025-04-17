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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.deliveredForm = this.fb.group({
      folio: ['', Validators.required],
      nombreCliente: ['', Validators.required],
      rutCliente: [
        '',
        [Validators.required, Validators.pattern('[0-9]{7,8}-[0-9kK]')],
      ],
      direccion: ['', Validators.required],
      comentario: [''],
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

    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.finishDrawing.bind(this));
    canvas.addEventListener('mouseleave', this.finishDrawing.bind(this));
    canvas.addEventListener('touchstart', this.startDrawing.bind(this));
    canvas.addEventListener('touchmove', this.draw.bind(this));
    canvas.addEventListener('touchend', this.finishDrawing.bind(this));
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
  }

  getSignatureDataURL(): string {
    return this.signaturePadElement.nativeElement.toDataURL();
  }

  onSubmit(): void {
    const formValue = this.deliveredForm.getRawValue();
    const signature = this.getSignatureDataURL();
    console.log('Enviando entrega:', { ...formValue, signature });
    // aquí invocas tu servicio para persistir formValue y signature
  }
}
