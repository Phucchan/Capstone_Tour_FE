// File: src/app/features/seller/pages/seller-dashboard/seller-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SellerBookingService } from '../../services/seller-booking.service';
import { SellerBookingSummary } from '../../models/seller-booking-summary.model';
import { PagingDTO } from '../../../../core/models/paging.model';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PaginationComponent,
    SpinnerComponent,
    FormatDatePipe,
  ],
  templateUrl: './seller-dashboard.component.html',
})
export class SellerDashboardComponent implements OnInit {
  private sellerService = inject(SellerBookingService);
  private currentUserService = inject(CurrentUserService);
  private router = inject(Router);

  availableBookings: PagingDTO<SellerBookingSummary> | null = null;
  editedBookings: PagingDTO<SellerBookingSummary> | null = null;

  isLoadingAvailable = true;
  isLoadingEdited = true;
  activeTab: 'available' | 'edited' = 'available';

  ngOnInit(): void {
    this.loadAvailableBookings();
    this.loadEditedBookings();
  }

  loadAvailableBookings(page: number = 0, size: number = 10): void {
    this.isLoadingAvailable = true;
    this.sellerService.getAvailableBookings(page, size).subscribe({
      next: (res) => {
        this.availableBookings = res.data;
        this.isLoadingAvailable = false;
      },
      error: () => (this.isLoadingAvailable = false),
    });
  }

  loadEditedBookings(page: number = 0, size: number = 10): void {
    // SỬA LỖI: Gọi phương thức getCurrentUser() để lấy thông tin user
    const username = this.currentUserService.getCurrentUser()?.username;
    if (!username) return;

    this.isLoadingEdited = true;
    this.sellerService.getEditedBookings(username, page, size).subscribe({
      next: (res) => {
        this.editedBookings = res.data;
        this.isLoadingEdited = false;
      },
      error: () => (this.isLoadingEdited = false),
    });
  }

  onClaimBooking(bookingId: number, event: MouseEvent): void {
    event.stopPropagation();
    // SỬA LỖI: Gọi phương thức getCurrentUser() để lấy thông tin user
    const username = this.currentUserService.getCurrentUser()?.username;
    if (!username) {
      alert('Không tìm thấy thông tin người dùng');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn nhận xử lý booking này?')) {
      this.sellerService.claimBooking(bookingId, username).subscribe({
        next: () => {
          alert('Nhận booking thành công!');
          this.loadAvailableBookings();
          this.loadEditedBookings();
        },
        error: (err) =>
          alert(`Lỗi: ${err.error.message || 'Không thể nhận booking'}`),
      });
    }
  }

  navigateToDetail(bookingId: number): void {
    this.router.navigate(['/seller/booking', bookingId]);
  }

  onPageChange(page: number, type: 'available' | 'edited'): void {
    if (type === 'available') {
      this.loadAvailableBookings(page);
    } else {
      this.loadEditedBookings(page);
    }
  }
}
