/*
 * FILE: src/app/features/business/pages/dashboard/dashboard.component.ts
 * MÔ TẢ:
 * - Thêm các module NG-ZORRO cần thiết cho Dashboard.
 * - Cập nhật form lọc ngày để sử dụng nz-range-picker.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { forkJoin, of } from 'rxjs';
import {
  catchError,
  finalize,
  debounceTime,
  distinctUntilChanged,
  startWith,
} from 'rxjs/operators';

// --- [THAY ĐỔI] Import các module của NG-ZORRO ---
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { DashboardService } from '../../services/dashboard.service';
import {
  TourRevenue,
  MonthlyRevenue,
} from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,
    // --- [THAY ĐỔI] Thêm các module NG-ZORRO vào imports ---
    NzGridModule,
    NzCardModule,
    NzStatisticModule,
    NzDatePickerModule,
    NzSpinModule,
    NzListModule,
    NzAlertModule,
    NzIconModule,
  ],
  providers: [CurrencyPipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private fb = inject(FormBuilder);
  private currencyPipe = inject(CurrencyPipe);

  isLoading = true;
  error: string | null = null;
  filterForm!: FormGroup;

  // Data Properties
  totalRevenue: number = 0;
  totalBookings: number = 0;
  totalNewUsers: number = 0;
  topTours: TourRevenue[] = [];
  monthlyRevenueData: any[] = [];
  bookingStatsData: any[] = [];

  // Chart Configuration
  chartColorScheme: Color = {
    name: 'business',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3B82F6', '#10B981', '#F97316', '#EF4444', '#8B5CF6'],
  };
  pieChartColorScheme: Color = {
    name: 'bookingStats',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#10B981', '#F97316', '#EF4444'],
  };

  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // --- [THAY ĐỔI] Cập nhật form để dùng với nz-range-picker ---
    this.filterForm = this.fb.group({
      dateRange: [[thirtyDaysAgo, today]],
    });

    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value), // Lấy dữ liệu ngay lần đầu
        debounceTime(400),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((value) => {
        if (value.dateRange && value.dateRange[0] && value.dateRange[1]) {
          this.fetchDashboardData(value.dateRange[0], value.dateRange[1]);
        }
      });
  }

  fetchDashboardData(startDate: Date, endDate: Date): void {
    this.isLoading = true;
    this.error = null;

    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);

    forkJoin({
      revenue: this.dashboardService
        .getTotalRevenue(start, end)
        .pipe(catchError(() => of({ data: 0 }))),
      bookings: this.dashboardService
        .getTotalBookings(start, end)
        .pipe(catchError(() => of({ data: 0 }))),
      newUsers: this.dashboardService
        .getTotalNewUsers(start, end)
        .pipe(catchError(() => of({ data: 0 }))),
      topTours: this.dashboardService
        .getTopToursByRevenue(5, start, end)
        .pipe(catchError(() => of({ data: [] }))),
      monthlyRevenue: this.dashboardService
        .getMonthlyRevenueSummary(start, end)
        .pipe(catchError(() => of({ data: [] }))),
      bookingStats: this.dashboardService
        .getBookingStats(start, end)
        .pipe(
          catchError(() =>
            of({ data: { cancelledBookings: 0, returningCustomers: 0 } })
          )
        ),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (results) => {
          this.totalRevenue = results.revenue.data ?? 0;
          this.totalBookings = results.bookings.data ?? 0;
          this.totalNewUsers = results.newUsers.data ?? 0;
          this.topTours = results.topTours.data ?? [];

          this.monthlyRevenueData = (results.monthlyRevenue.data ?? []).map(
            (item: MonthlyRevenue) => ({
              name: `Tháng ${item.month}/${item.year}`,
              value: item.revenue,
            })
          );

          const stats = results.bookingStats.data ?? {
            cancelledBookings: 0,
            returningCustomers: 0,
          };
          const newCustomerBookings =
            this.totalBookings - (stats.returningCustomers ?? 0);

          this.bookingStatsData = [
            {
              name: 'Khách hàng mới',
              value: newCustomerBookings > 0 ? newCustomerBookings : 0,
            },
            { name: 'Khách quay lại', value: stats.returningCustomers ?? 0 },
            { name: 'Booking đã hủy', value: stats.cancelledBookings ?? 0 },
          ];
        },
        error: (err) => {
          this.error = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.';
          console.error('An error occurred while fetching data:', err);
        },
      });
  }

  yAxisTickFormat = (val: number): string => {
    return this.currencyPipe.transform(val, 'VND', '', '1.0-0') || '';
  };

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
