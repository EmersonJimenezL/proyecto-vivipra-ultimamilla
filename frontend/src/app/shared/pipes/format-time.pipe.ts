import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
})
export class FormatTimePipe implements PipeTransform {
  transform(time: string): string {
    if (!time) return '';
    const timeString = time.toString().padStart(6, '0');
    const hours = parseInt(timeString.substring(0, 2), 10);
    const minutes = timeString.substring(2, 4);
    const seconds = timeString.substring(4, 6);
    return `${hours}:${minutes}:${seconds}`;
  }
}
