import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    let date: Date;

    // Nếu là string ISO, cắt bớt microseconds (6 chữ số sau dấu chấm)
    if (typeof value === 'string' && value.includes('.')) {
      const trimmed = value.replace(/\.\d{6}/, '');
      date = new Date(trimmed);
    } else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) return '';

    console.log('Parsed date:', date);

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `1 phút`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} ngày trước`;
  }
}
