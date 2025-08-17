import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// --- [CẬP NHẬT] Imports cho các module của NG-ZORRO ---
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

// --- Imports từ project của bạn ---
import { SellerBookingService } from '../../services/seller-booking.service';
import { RequestBookingSummary } from '../../models/request-booking-summary.model';
import { Paging } from '../../../../core/models/paging.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-seller-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormatDatePipe,
    // NG-ZORRO Modules
    NzTableModule,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzPopconfirmModule,
  ],
  templateUrl: './seller-request-list.component.html',
})
export class SellerRequestListComponent implements OnInit {
  private sellerService = inject(SellerBookingService);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

  requests: RequestBookingSummary[] = [];
  isLoading = true;
  paging: Paging<any> = { page: 0, size: 10, total: 0, items: [] };

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(
    page: number = this.paging.page,
    size: number = this.paging.size
  ): void {
    this.isLoading = true;
    this.sellerService
      .getRequestBookings(page, size)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.requests = res.data.items;
            this.paging = res.data;
          } else {
            this.message.error(
              res.message || 'Không thể tải danh sách yêu cầu.'
            );
          }
        },
        error: () => this.message.error('Đã xảy ra lỗi. Vui lòng thử lại.'),
      });
  }

  onApprove(requestId: number): void {
    // Logic xác nhận đã được chuyển sang nz-popconfirm trên template
    this.sellerService.approveRequestBooking(requestId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.message.success('Duyệt yêu cầu thành công!');
          this.loadRequests(); // Tải lại danh sách sau khi duyệt thành công
        } else {
          this.message.error(res.message || 'Duyệt yêu cầu thất bại.');
        }
      },
      error: (err) =>
        this.message.error(err.error?.message || 'Đã xảy ra lỗi.'),
    });
  }

  onPageIndexChange(page: number): void {
    // nz-table trả về page index 1-based, cần trừ 1 để gọi API
    this.paging.page = page - 1;
    this.loadRequests();
  }
}
