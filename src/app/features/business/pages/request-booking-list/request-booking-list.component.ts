/*
 * FILE: src/app/features/business/pages/request-booking-list/request-booking-list.component.ts
 * MÔ TẢ:
 * - Sửa lỗi import, sử dụng đúng type RequestBookingNotification.
 * - Cập nhật logic để sử dụng phân trang tích hợp của nz-table.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

// --- [THAY ĐỔI] Import các module của NG-ZORRO ---
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RequestBookingService } from '../../services/request-booking.service';
// --- [SỬA LỖI] Import đúng type từ file model ---
import {
  RequestBookingNotification,
  RequestBookingStatus,
} from '../../models/request-booking.model';

@Component({
  selector: 'app-request-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    // --- [THAY ĐỔI] Thêm các module NG-ZORRO ---
    NzTableModule,
    NzTagModule,
    NzCardModule,
  ],
  templateUrl: './request-booking-list.component.html',
})
export class RequestBookingListComponent implements OnInit {
  private requestBookingService = inject(RequestBookingService);
  private message = inject(NzMessageService);

  // --- [SỬA LỖI] Sử dụng đúng type cho mảng requests ---
  requests: RequestBookingNotification[] = [];
  isLoading = true;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 1;

  public RequestBookingStatus = RequestBookingStatus;

  ngOnInit(): void {
    // nz-table sẽ tự động gọi onQueryParamsChange lần đầu tiên
  }

  loadRequests(pageIndex: number = this.pageIndex): void {
    this.isLoading = true;
    this.pageIndex = pageIndex;
    this.requestBookingService
      .getRequests(pageIndex - 1, this.pageSize)
      .subscribe({
        next: (response) => {
          this.requests = response.items;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.message.error('Tải danh sách yêu cầu thất bại!');
          console.error(err);
        },
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex } = params;
    this.loadRequests(pageIndex);
  }

  getStatusColor(status: RequestBookingStatus): string {
    const colors = {
      [RequestBookingStatus.PENDING]: 'gold',
      [RequestBookingStatus.ACCEPTED]: 'green',
      [RequestBookingStatus.REJECTED]: 'red',
      [RequestBookingStatus.COMPLETED]: 'blue',
    };
    return colors[status] || 'default';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      PENDING: 'Chờ xử lý',
      ACCEPTED: 'Đã chấp nhận',
      REJECTED: 'Đã từ chối',
      COMPLETED: 'Đã hoàn thành',
    };
    return texts[status] || status;
  }
}
