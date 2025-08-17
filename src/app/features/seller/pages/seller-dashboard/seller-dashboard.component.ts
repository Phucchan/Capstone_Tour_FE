import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

// --- [THÊM MỚI] Imports cho các module của NG-ZORRO ---
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

// --- Imports từ project của bạn ---
import { SellerBookingService } from '../../services/seller-booking.service';
import { SellerBookingSummary } from '../../models/seller-booking-summary.model';
import { Paging } from '../../../../core/models/paging.model';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { StatusVietnamesePipe } from '../../../../shared/pipes/status-vietnamese.pipe';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormatDatePipe,
    StatusVietnamesePipe,
    // NG-ZORRO Modules
    NzTableModule,
    NzTabsModule,
    NzButtonModule,
    NzTagModule,
    NzPopconfirmModule,
    NzPageHeaderModule,
  ],
  templateUrl: './seller-dashboard.component.html',
})
export class SellerDashboardComponent implements OnInit {
  private sellerService = inject(SellerBookingService);
  private currentUserService = inject(CurrentUserService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  availableBookings: Paging<SellerBookingSummary> | null = null;
  editedBookings: Paging<SellerBookingSummary> | null = null;

  isLoadingAvailable = true;
  isLoadingEdited = false; // Chỉ load tab đầu tiên lúc đầu
  selectedTabIndex = 0;

  // Pagination properties
  pageSize = 10;
  availableBookingsPage = 1;
  editedBookingsPage = 1;

  ngOnInit(): void {
    this.loadAvailableBookings();
  }

  onTabChange(): void {
    // Chỉ load dữ liệu cho tab "Booking của tôi" khi nó được chọn lần đầu
    if (this.selectedTabIndex === 1 && !this.editedBookings) {
      this.loadEditedBookings();
    }
  }

  loadAvailableBookings(reset: boolean = false): void {
    if (reset) {
      this.availableBookingsPage = 1;
    }
    this.isLoadingAvailable = true;
    this.sellerService
      .getAvailableBookings(this.availableBookingsPage - 1, this.pageSize)
      .pipe(finalize(() => (this.isLoadingAvailable = false)))
      .subscribe({
        next: (res) => (this.availableBookings = res.data),
        error: () =>
          this.message.error('Không thể tải danh sách booking chờ xử lý.'),
      });
  }

  loadEditedBookings(reset: boolean = false): void {
    if (reset) {
      this.editedBookingsPage = 1;
    }
    const username = this.currentUserService.getCurrentUser()?.username;
    if (!username) return;

    this.isLoadingEdited = true;
    this.sellerService
      .getEditedBookings(username, this.editedBookingsPage - 1, this.pageSize)
      .pipe(finalize(() => (this.isLoadingEdited = false)))
      .subscribe({
        next: (res) => (this.editedBookings = res.data),
        error: () =>
          this.message.error('Không thể tải danh sách booking của bạn.'),
      });
  }

  onClaimBooking(bookingId: number): void {
    const username = this.currentUserService.getCurrentUser()?.username;
    if (!username) {
      this.message.error('Không tìm thấy thông tin người dùng');
      return;
    }

    this.sellerService.claimBooking(bookingId, username).subscribe({
      next: () => {
        this.message.success('Nhận booking thành công!');
        this.loadAvailableBookings();
        // Nếu tab "Booking của tôi" đã được mở, load lại
        if (this.editedBookings) {
          this.loadEditedBookings();
        }
      },
      error: (err) =>
        this.message.error(err.error.message || 'Không thể nhận booking'),
    });
  }

  navigateToDetail(bookingId: number): void {
    this.router.navigate(['/seller/booking', bookingId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'CONFIRMED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  }
}
