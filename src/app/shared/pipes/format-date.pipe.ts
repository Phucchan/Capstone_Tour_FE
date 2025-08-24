import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  /**
   * Transforms a date value into a formatted string.
   * @param value The date to format.
   * @param format The format string (e.g., 'dd/MM/yyyy HH:mm'). Defaults to 'dd/MM/yyyy'.
   * @returns The formatted date string.
   */
  transform(
    value: string | Date | null | undefined,
    format: string = 'dd/MM/yyyy'
  ): string {
    if (!value) {
      return '';
    }

    // Use Angular's built-in DatePipe for robust formatting
    const datePipe = new DatePipe('en-US');
    try {
      return datePipe.transform(value, format) || '';
    } catch (error) {
      console.error('Invalid date value for FormatDatePipe', error);
      return ''; // Return empty string for invalid dates
    }
  }
}
