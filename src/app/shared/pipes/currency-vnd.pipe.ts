import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyVnd',
  standalone: true
})
export class CurrencyVndPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
  ): string {
    if (value === null || value === undefined) return '';

    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${numberValue.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`;
  }
}
