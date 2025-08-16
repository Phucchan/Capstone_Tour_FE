// src/app/features/customer/components/tour-private/tour-private.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { DurationFormatPipe } from '../../../../shared/pipes/duration-format.pipe';
import { IconTransportPipe } from '../../../../shared/pipes/icon-transport.pipe';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { RequestBookingService } from '../../services/request-booking.service';

@Component({
  selector: 'app-tour-private',
  standalone: true,
  templateUrl: './tour-private.component.html',
  styleUrls: ['./tour-private.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyVndPipe,
    DurationFormatPipe,
    IconTransportPipe,
    PaginationComponent,
  ]
})
export class TourPrivateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // state
  tours: any[] = [];
  total = 0;
  page  = 0;
  size  = 10;
  visibleTours: any[] = [];   
  search = '';      
  selectedDate?: string;              // ô tìm kiếm
  isLoading = true;
  errorMsg: string | null = null;

  constructor(
    private service: RequestBookingService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Gọi API tải dữ liệu */
  fetch(): void {
    const userId = this.currentUserService.getCurrentUser().id;
    if (!userId) {
      this.errorMsg = 'Không xác định được người dùng.';
      return;
    }

    this.isLoading = true;
    this.errorMsg = null;
    this.service.getPrivateTours(
      userId,
      {
        page: this.page,
        size: this.size,
        search: this.search?.trim() || undefined,
      }
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        // Swagger mẫu: res.data.tours.items | total | page | size
        this.tours = res?.data?.items ?? res?.data?.tours?.items ?? [];
        this.total = res?.data?.total ?? res?.data?.tours?.total ?? 0;
        this.applyLocalFilters(); 
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Tải danh sách tour thất bại.';
        this.isLoading = false;
      }
    });
  }

  applyLocalFilters(): void {
    if (!this.selectedDate) {
      this.visibleTours = this.tours.slice();
      return;
    }
    const pick = new Date(this.selectedDate);
    const y = pick.getFullYear(), m = pick.getMonth(), d = pick.getDate();

    this.visibleTours = this.tours.filter(t => {
      // hỗ trợ cả field startDate (ISO) lẫn mảng departureDates
      const dates: (string|Date)[] =
        Array.isArray(t?.departureDates) && t.departureDates.length
          ? t.departureDates
          : (t?.startDate ? [t.startDate] : []);

      return dates.some(dt => {
        const dd = new Date(dt);
        return dd.getFullYear() === y && dd.getMonth() === m && dd.getDate() === d;
      });
    });
  }

   resetFilters(): void {
    this.search = '';
    this.selectedDate = undefined;
    this.page = 0;
    this.fetch();
  }
  onDateChange(v: string): void { 
    this.selectedDate = v; 
    this.applyLocalFilters(); 
  }
  /** Enter tìm kiếm hoặc bấm nút */
  onSearch(): void {
    this.page = 0;
    this.fetch();
  }

  /** Xóa từ khóa */
  clearSearch(): void {
    this.search = '';
    this.page = 0;
    this.fetch();
  }

  /** Phân trang */
  onPageChange(p: number): void {
    const totalPages = Math.ceil(this.total / this.size);
    if (p < 0 || p >= totalPages) return;
    this.page = p;
    this.fetch();
  }
}
