import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iconTransport',
  standalone: true,
})
export class IconTransportPipe implements PipeTransform {
  transform(value: string): string {
    switch (value?.toLowerCase()) {
      case 'car':
        return '🚗 Ô tô';
      case 'plane':
        return '✈️ Máy bay';
      case 'train':
        return '🚆 Tàu hoả';
      default:
        return '❓ Không rõ';
    }
  }
}
