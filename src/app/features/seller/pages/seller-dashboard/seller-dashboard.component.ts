import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize, debounceTime, startWith } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// --- Imports cho các module của NG-ZORRO ---
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';

// --- Imports từ project của bạn ---
import { SellerBookingService } from '../../services/seller-booking.service';
import { SellerBookingSummary } from '../../models/seller-booking-summary.model';
import { Paging } from '../../../../core/models/paging.model';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { StatusVietnamesePipe } from '../../../../shared/pipes/status-vietnamese.pipe';
import { BookingStatus } from '../../../../core/models/enums';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormatDatePipe,
    StatusVietnamesePipe,
    NzTableModule,
    NzTabsModule,
    NzButtonModule,
    NzTagModule,
    NzPopconfirmModule,
    NzPageHeaderModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzGridModule,
  ],
  templateUrl: './seller-dashboard.component.html',
})
export class SellerDashboardComponent implements OnInit {
  private sellerService = inject(SellerBookingService);
  private currentUserService = inject(CurrentUserService);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private fb = inject(FormBuilder);

  filterForm!: FormGroup;
  bookingStatuses: BookingStatus[] = [
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'CANCEL_REQUESTED',
    'REFUNDED',
  ];

  rawAvailableBookings: SellerBookingSummary[] = [];
  filteredAvailableBookings: SellerBookingSummary[] = [];

  rawEditedBookings: SellerBookingSummary[] = [];
  filteredEditedBookings: SellerBookingSummary[] = [];

  availableBookingsPaging: Paging<SellerBookingSummary> | null = null;
  editedBookingsPaging: Paging<SellerBookingSummary> | null = null;

  isLoadingAvailable = true;
  isLoadingEdited = false;
  selectedTabIndex = 0;

  pageSize = 10;
  availableBookingsPage = 1;
  editedBookingsPage = 1;

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      keyword: [null],
      status: [null],
    });

    this.loadAvailableBookings();

    this.filterForm.valueChanges
      .pipe(startWith(this.filterForm.value), debounceTime(300))
      .subscribe(() => {
        this.applyClientSideFilters();
      });
  }

  applyClientSideFilters(): void {
    const { keyword, status } = this.filterForm.value;
    const keywordLower = keyword?.toLowerCase().trim() || '';

    if (this.selectedTabIndex === 0) {
      this.filteredAvailableBookings = this.rawAvailableBookings.filter(
        (booking) => {
          const statusMatch = !status || booking.status === status;
          const keywordMatch =
            !keywordLower ||
            booking.bookingCode.toLowerCase().includes(keywordLower) ||
            booking.tourName.toLowerCase().includes(keywordLower) ||
            booking.customer.toLowerCase().includes(keywordLower);
          return statusMatch && keywordMatch;
        }
      );
    } else {
      this.filteredEditedBookings = this.rawEditedBookings.filter((booking) => {
        const statusMatch = !status || booking.status === status;
        const keywordMatch =
          !keywordLower ||
          booking.bookingCode.toLowerCase().includes(keywordLower) ||
          booking.tourName.toLowerCase().includes(keywordLower) ||
          booking.customer.toLowerCase().includes(keywordLower);
        return statusMatch && keywordMatch;
      });
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.filterForm.reset(
      { keyword: null, status: null },
      { emitEvent: false }
    );
    if (this.selectedTabIndex === 0) {
      if (!this.availableBookingsPaging) this.loadAvailableBookings();
    } else {
      if (!this.editedBookingsPaging) this.loadEditedBookings();
    }
    this.applyClientSideFilters();
  }

  loadAvailableBookings(reset: boolean = false): void {
    if (reset) this.availableBookingsPage = 1;
    this.isLoadingAvailable = true;

    this.sellerService
      .getAvailableBookings(this.availableBookingsPage - 1, this.pageSize)
      .pipe(finalize(() => (this.isLoadingAvailable = false)))
      .subscribe({
        next: (res) => {
          this.availableBookingsPaging = res.data;
          this.rawAvailableBookings = res.data.items || [];
          this.applyClientSideFilters();
        },
        error: () =>
          this.message.error('Không thể tải danh sách booking chờ xử lý.'),
      });
  }

  loadEditedBookings(reset: boolean = false): void {
    if (reset) this.editedBookingsPage = 1;
    const username = this.currentUserService.getCurrentUser()?.username;
    if (!username) return;

    this.isLoadingEdited = true;

    this.sellerService
      .getEditedBookings(username, this.editedBookingsPage - 1, this.pageSize)
      .pipe(finalize(() => (this.isLoadingEdited = false)))
      .subscribe({
        next: (res) => {
          this.editedBookingsPaging = res.data;
          this.rawEditedBookings = res.data.items || [];
          this.applyClientSideFilters();
        },
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
        if (this.editedBookingsPaging) {
          this.loadEditedBookings();
        }
      },
      error: (err) =>
        this.message.error(err.error.message || 'Không thể nhận booking'),
    });
  }

  navigateToDetail(bookingId: number, isOwned: boolean): void {
    this.router.navigate(['/seller/booking', bookingId], {
      queryParams: { isOwner: isOwned },
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'PAID':
        return 'processing';
      case 'CONFIRMED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'CANCEL_REQUESTED':
        return 'gold';
      case 'REFUNDED':
        return 'blue';
      case 'COMPLETED':
        return 'purple';
      default:
        return 'default';
    }
  }
}
