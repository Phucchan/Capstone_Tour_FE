/*
----------------------------------------------------------------
-- File: src/app/features/accountant/pages/refund-request-list/refund-request-list.component.ts
-- Ghi chú: Component hiển thị danh sách yêu cầu hoàn tiền.
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
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { AccountantService } from '../../services/accountant.service';
import { BookingRefund } from '../../models/booking-refund.model';
import { PagingDTO } from '../../../../core/models/paging.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-refund-request-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzEmptyModule,
    PaginationComponent,
    FormatDatePipe,
  ],
  templateUrl: './refund-request-list.component.html',
})
export class RefundRequestListComponent implements OnInit {
  private accountantService = inject(AccountantService);
  private router = inject(Router);

  refunds: PagingDTO<BookingRefund> = {
    items: [],
    page: 0,
    size: 10,
    total: 0,
  };
  isLoading = true;

  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadRefunds();
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.loadRefunds(1, searchValue);
      });
  }

  loadRefunds(page: number = 1, search: string | null = null): void {
    this.isLoading = true;
    const currentPage = page - 1;
    const currentSearch = search === null ? this.searchTerm : search;

    this.accountantService
      .getRefundRequests(currentSearch, currentPage, this.refunds.size)
      .subscribe({
        next: (data) => {
          this.refunds = data;
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
    this.loadRefunds(page);
  }

  viewDetail(bookingId: number): void {
    this.router.navigate(['/accountant/refunds', bookingId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CANCEL_REQUESTED':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      case 'REFUNDED':
        return 'green';
      default:
        return 'default';
    }
  }
}
