import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize, debounceTime } from 'rxjs';
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
    // NG-ZORRO Modules
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

  availableBookings: Paging<SellerBookingSummary> | null = null;
  editedBookings: Paging<SellerBookingSummary> | null = null;

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

    this.filterForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    if (this.selectedTabIndex === 0) {
      this.loadAvailableBookings(true);
    } else {
      this.loadEditedBookings(true);
    }
  }

  onTabChange(): void {
    if (this.selectedTabIndex === 0) {
      this.loadAvailableBookings(true);
    } else {
      this.loadEditedBookings(true);
    }
  }

  loadAvailableBookings(reset: boolean = false): void {
    if (reset) {
      this.availableBookingsPage = 1;
    }
    this.isLoadingAvailable = true;
    const { keyword, status } = this.filterForm.value;

    this.sellerService
      .getAvailableBookings(
        this.availableBookingsPage - 1,
        this.pageSize,
        keyword,
        status
      )
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
    const { keyword, status } = this.filterForm.value;

    this.sellerService
      .getEditedBookings(
        username,
        this.editedBookingsPage - 1,
        this.pageSize,
        keyword,
        status
      )
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
