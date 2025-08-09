import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnChanges {
  /** 0-based */
  @Input() currentPage = 0;
  @Input() totalItems = 0;
  @Input() pageSize = 10;

  /** số trang hiển thị hai bên trang hiện tại (mặc định 1: ... 3 [4] 5 ...) */
  @Input() siblingCount = 1;

  @Output() pageChange = new EventEmitter<number>();
  track = (_: number, v: number | '...') => (v === '...' ? -1 : v);
  get totalPages(): number {
    const size = Math.max(1, this.pageSize || 1);
    return Math.max(0, Math.ceil(this.totalItems / size));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Clamp currentPage khi totalItems/pageSize đổi
    const maxPage = Math.max(this.totalPages - 1, 0);
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    if (this.currentPage < 0) this.currentPage = 0;
  }

  get visiblePages(): (number | '...')[] {
    const total = this.totalPages;
    if (total <= 1) return [];

    const cur = this.currentPage + 1; // 1-based for display
    const left = Math.max(2, cur - this.siblingCount);
    const right = Math.min(total - 1, cur + this.siblingCount);

    const pages: (number | '...')[] = [1];

    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('...');
    pages.push(total);

    return pages;
  }

  changePage(p: number | '...') {
    if (p === '...') return;
    const zeroBased = p - 1;
    if (zeroBased === this.currentPage) return;
    this.pageChange.emit(zeroBased);
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
