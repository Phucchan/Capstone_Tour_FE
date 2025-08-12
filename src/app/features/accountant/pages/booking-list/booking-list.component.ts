/*
----------------------------------------------------------------
-- File: src/app/features/accountant/pages/booking-list/booking-list.component.ts
-- Ghi chú: Component hiển thị danh sách booking cần quyết toán.
----------------------------------------------------------------
*/
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
// Ghi chú: Thêm import cho NzEmptyModule để sửa lỗi
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { AccountantService } from '../../services/accountant.service';
import { BookingList } from '../../models/booking-list.model';
import { PagingDTO } from '../../../../core/models/paging.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzCardModule,
    NzToolTipModule,
    // Ghi chú: Thêm NzEmptyModule vào đây
    NzEmptyModule,
    PaginationComponent,
    FormatDatePipe,
  ],
  templateUrl: './booking-list.component.html',
})
export class BookingListComponent implements OnInit {
  private accountantService = inject(AccountantService);
  private router = inject(Router);

  bookings: PagingDTO<BookingList> = {
    items: [],
    page: 0,
    size: 10,
    total: 0,
  };
  isLoading = true;

  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadBookings();
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.loadBookings(1, searchValue);
      });
  }

  loadBookings(page: number = 1, search: string | null = null): void {
    this.isLoading = true;
    const currentPage = page - 1;
    const currentSearch = search === null ? this.searchTerm : search;

    this.accountantService
      .getBookings(currentSearch, currentPage, this.bookings.size)
      .subscribe({
        next: (data) => {
          this.bookings = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number): void {
    this.loadBookings(page);
  }

  viewSettlementDetail(bookingId: number): void {
    this.router.navigate(['/accountant/bookings', bookingId, 'settlement']);
  }

  getStatusColor(status: string): string {
    if (!status) return 'default';

    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'red';
      // Ghi chú: Thêm màu cho trạng thái yêu cầu hủy
      case 'CANCEL_REQUESTED':
        return 'orange';
      case 'PENDING':
        return 'gold';
      default:
        return 'default';
    }
  }
}
