// duration-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat',
  standalone: true
})
export class DurationFormatPipe implements PipeTransform {
transform(durationDays: number | null | undefined): string { // change
    const days = Number(durationDays ?? 0);                    // change
    const safeDays = isNaN(days) || days < 0 ? 0 : days;       // change
    const nights = safeDays > 0 ? safeDays - 1 : 0;            // change
    return `${safeDays} ngày ${nights} đêm`;   
  }
}
// This pipe formats a duration in days into a string that indicates the number of days and nights.