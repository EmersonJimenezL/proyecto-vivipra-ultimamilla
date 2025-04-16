import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatTimePipe } from './pipes/format-time.pipe';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormatTimePipe],
  exports: [FormatTimePipe],
})
export class SharedModule {}
