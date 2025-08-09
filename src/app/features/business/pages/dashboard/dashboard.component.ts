import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service';
import {
  TourRevenue,
  MonthlyRevenue,
  BookingStats,
} from '../../../../core/models/dashboard.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

//Tạo một custom validator function
export const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  // Chỉ validate khi cả hai ngày đều có giá trị
  if (startDate && endDate) {
    const isError = new Date(endDate) < new Date(startDate);
    // Nếu ngày kết thúc nhỏ hơn ngày bắt đầu, trả về lỗi
    return isError ? { dateRange: true } : null;
  }

  // Nếu không có lỗi, trả về null
  return null;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,
    SpinnerComponent,
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

  // --- Data Properties ---
  totalRevenue: number = 0;
  totalBookings: number = 0;
  totalNewUsers: number = 0;
  topTours: TourRevenue[] = [];

  monthlyRevenueData: any[] = [];
  bookingStatsData: any[] = [];

  // --- Chart Configuration ---
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
    domain: ['#10B981', '#F97316', '#EF4444'], // Green for New, Orange for Returning, Red for Cancelled
  };

  ngOnInit(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group(
      {
        startDate: [this.formatDate(firstDayOfMonth)],
        endDate: [this.formatDate(today)],
      },
      {
        //Thêm custom validator vào form group
        validators: dateRangeValidator,
      }
    );

    this.fetchDashboardData();

    // Chỉ fetch lại data khi form hợp lệ
    this.filterForm.valueChanges.subscribe(() => {
      if (this.filterForm.valid) {
        this.fetchDashboardData();
      }
    });
  }

  fetchDashboardData(): void {
    //Chỉ fetch khi form hợp lệ
    if (this.filterForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    //Vô hiệu hóa form khi đang tải dữ liệu
    this.filterForm.disable();

    const { startDate, endDate } = this.filterForm.value;

    forkJoin({
      revenue: this.dashboardService
        .getTotalRevenue(startDate, endDate)
        .pipe(catchError(() => of({ data: 0 }))),
      bookings: this.dashboardService
        .getTotalBookings(startDate, endDate)
        .pipe(catchError(() => of({ data: 0 }))),
      newUsers: this.dashboardService
        .getTotalNewUsers(startDate, endDate)
        .pipe(catchError(() => of({ data: 0 }))),
      topTours: this.dashboardService
        .getTopToursByRevenue(5, startDate, endDate)
        .pipe(catchError(() => of({ data: [] }))),
      monthlyRevenue: this.dashboardService
        .getMonthlyRevenueSummary(startDate, endDate)
        .pipe(catchError(() => of({ data: [] }))),
      bookingStats: this.dashboardService
        .getBookingStats(startDate, endDate)
        .pipe(
          catchError(() =>
            of({ data: { cancelledBookings: 0, returningCustomers: 0 } })
          )
        ),
    }).subscribe({
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

        this.isLoading = false;
        this.filterForm.enable(); // Bật lại form sau khi tải xong
      },
      error: (err) => {
        this.error = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.';
        this.isLoading = false;
        this.filterForm.enable(); // Bật lại form nếu có lỗi
        console.error(err);
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
