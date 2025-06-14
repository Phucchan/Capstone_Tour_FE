import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'birthDate',
  standalone: true,
})
export class BirthDate implements PipeTransform {
  transform(value: string | null, format: string = 'dd/MM/yyyy'): string {
    if (!value) return 'Không có';

    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Không hợp lệ';

    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
