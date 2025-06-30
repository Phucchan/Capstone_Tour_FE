import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shuffle',
  standalone: true
})
export class ShufflePipe implements PipeTransform {
  transform(array: any[]): any[] {
    if (!array) return [];
    return array.sort(() => Math.random() - 0.5);
  }
}
