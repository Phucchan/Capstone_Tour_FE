// duration-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'durationFormat' })
export class DurationFormatPipe implements PipeTransform {
  transform(durationDays: number): string {
    const nights = durationDays > 0 ? durationDays - 1 : 0;
    return `${durationDays} ngày ${nights} đêm`;
  }
}
// This pipe formats a duration in days into a string that indicates the number of days and nights.