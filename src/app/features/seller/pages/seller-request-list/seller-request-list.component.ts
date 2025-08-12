import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerBookingService } from '../../services/seller-booking.service';
import { RequestBookingSummary } from '../../models/request-booking-summary.model';
import { PagingDTO } from '../../../../core/models/paging.model';

// SỬA: Import đầy đủ các module cần thiết
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzEmptyModule } from 'ng-zorro-antd/empty'; // MỚI
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-seller-request-list',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzPaginationModule,
    NzEmptyModule, // MỚI
    FormatDatePipe,
  ],
  templateUrl: './seller-request-list.component.html',
})
export class SellerRequestListComponent implements OnInit {
  private sellerService = inject(SellerBookingService);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

  requests: RequestBookingSummary[] = [];

  isLoading = true;
  paging: PagingDTO<any> = { page: 0, size: 10, total: 0, items: [] };

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(
    page: number = this.paging.page,
    size: number = this.paging.size
  ): void {
    this.isLoading = true;
    this.sellerService.getRequestBookings(page, size).subscribe({
      next: (res) => {
        // SỬA: Thay đổi cách kiểm tra response cho đúng với model ApiResponse
        if (res && res.data) {
          this.requests = res.data.items;
          this.paging = res.data;
        } else {
          this.message.error(res.message || 'Không thể tải danh sách yêu cầu.');
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
      },
    });
  }

  onApprove(requestId: number): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc muốn duyệt yêu cầu này?',
      nzContent: 'Hành động này sẽ chuyển yêu cầu cho bộ phận kinh doanh.',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.sellerService.approveRequestBooking(requestId).subscribe({
          next: (res) => {
            // SỬA: Thay đổi cách kiểm tra response
            if (res && res.data) {
              this.message.success('Duyệt yêu cầu thành công!');
              this.loadRequests();
            } else {
              this.message.error(res.message || 'Duyệt yêu cầu thất bại.');
            }
          },
          error: (err) =>
            this.message.error(err.error?.message || 'Đã xảy ra lỗi.'),
        });
      },
    });
  }

  onPageIndexChange(page: number): void {
    this.paging.page = page - 1;
    this.loadRequests();
  }
}
