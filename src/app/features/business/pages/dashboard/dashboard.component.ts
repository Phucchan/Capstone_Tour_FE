import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service';

import {
  TourRevenue,
  MonthlyNewUser,
} from '../../../../core/models/dashboard.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,
    CurrencyPipe,
    DatePipe,
    SpinnerComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private fb = inject(FormBuilder);

  // --- State Management ---
  isLoading = true;
  error: string | null = null;
  filterForm!: FormGroup;

  // --- Data Properties ---
  totalRevenue: number = 0;
  totalBookings: number = 0;
  totalNewUsers: number = 0;
  topTours: TourRevenue[] = [];
  monthlyNewUsersData: any[] = [];

  // --- Chart Configuration ---
  chartColorScheme: Color = {
    name: 'business',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#10B981', '#3B82F6', '#F97316', '#8B5CF6', '#EF4444'],
  };

  ngOnInit(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      startDate: [this.formatDate(firstDayOfMonth)],
      endDate: [this.formatDate(today)],
    });

    this.fetchDashboardData();
    this.filterForm.valueChanges.subscribe(() => this.fetchDashboardData());
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    this.error = null;
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
      monthlyUsers: this.dashboardService
        .getMonthlyNewUsers(startDate, endDate)
        .pipe(catchError(() => of({ data: [] }))),
      topTours: this.dashboardService
        .getTopToursByRevenue(5, startDate, endDate)
        .pipe(catchError(() => of({ data: [] }))),
    }).subscribe({
      next: (results) => {
        this.totalRevenue = results.revenue.data ?? 0;
        this.totalBookings = results.bookings.data ?? 0;
        this.totalNewUsers = results.newUsers.data ?? 0;
        this.topTours = results.topTours.data ?? [];


        this.monthlyNewUsersData = (results.monthlyUsers.data ?? []).map(
          (item: MonthlyNewUser) => ({
            name: `Tháng ${item.month}/${item.year}`,
            value: item.userCount,
          })
        );

        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }

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
