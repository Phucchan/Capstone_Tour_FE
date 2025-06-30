// src/app/shared/components/pagination/pagination.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input() currentPage: number = 0; // 0-based
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get visiblePages(): (number | '...')[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1;

    const range: (number | '...')[] = [];

    const left = Math.max(1, current + 1 - delta);
    const right = Math.min(total, current + 1 + delta);

    const showLeftDots = left > 2;
    const showRightDots = right < total - 1;

    range.push(1);

    if (showLeftDots) range.push('...');

    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== total) {
        range.push(i);
      }
    }

    if (showRightDots) range.push('...');

    if (total > 1) range.push(total);

    return range;
  }

  changePage(p: number | '...') {
    if (p === '...' || p - 1 === this.currentPage) return;
    this.pageChange.emit((p as number) - 1);
  }

  previous() {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  next() {
    if (this.currentPage + 1 < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
