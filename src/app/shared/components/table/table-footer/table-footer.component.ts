import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-table-footer',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './table-footer.component.html',
  styleUrls: ['./table-footer.component.css'],
})
export class TableFooterComponent {
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  inputPage = '';

  onPageSizeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newSize = Number(selectElement.value);
    this.pageSizeChange.emit(newSize);
  }

  onPageSelect(page: number | string) {
    if (typeof page === 'number') {
      this.pageChange.emit(page - 1);
    }
  }
  
  getDisplayedPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 3) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage < 1) {
        pages.push(1);
        pages.push(2);
        pages.push('...', this.totalPages);
      }
      else if (this.currentPage < 2) {
        pages.push(1);
        pages.push(2);
        pages.push(3);
        pages.push('...');
      }
      else if (this.currentPage >= this.totalPages - 1) {
        pages.push(1, '...');
        pages.push(this.totalPages - 1);
        pages.push(this.totalPages);
      }
      else {
        pages.push('...');
        pages.push(this.currentPage, this.currentPage + 1, this.currentPage + 2);
        pages.push('...');
      }
    }
  
    return pages;
  }  

  goToPage(): void {
    const page = Number(this.inputPage);
    if (!isNaN(page) && page >= 0 && page <= this.totalPages) {
      this.onPageSelect(page);
    } else {
      alert('Invalid page number');
    }
    this.inputPage = '';
  }
}