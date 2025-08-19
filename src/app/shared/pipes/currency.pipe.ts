import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      isNaN(Number(value))
    ) {
      return 'Miễn phí';
    }

    const numberValue = typeof value === 'string' ? parseFloat(value) : value;

    if (numberValue <= 0) {
      return 'Miễn phí';
    }

    return `${numberValue.toLocaleString('vi-VN', {
      maximumFractionDigits: 0,
    })}` + ' VND';
  }
}
