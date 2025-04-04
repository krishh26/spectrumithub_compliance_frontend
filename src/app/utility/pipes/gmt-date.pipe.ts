import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gmtDate'
})
export class GmtDatePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

     // Example output: "Sun, 23 Mar 2025 00:00:00 GMT"
     const utcString = date.toUTCString();

     // Remove time portion: keep only "Day, DD Mon YYYY GMT"
    // Split by spaces and reconstruct the needed parts
    const parts = utcString.split(' '); // ["Sun,", "23", "Mar", "2025", "00:00:00", "GMT"]
    if (parts.length >= 6) {
      return `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
    }

    return ''; // Fallback if something goes wrong
  }

}
