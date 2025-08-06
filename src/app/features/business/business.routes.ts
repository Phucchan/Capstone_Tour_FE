import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

// Không cần import các component ở đây nữa

export const BUSINESS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Chuyển đổi tất cả các route sang loadComponent
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
        data: { title: 'Dashboard' },
      },
      {
        path: 'locations',
        loadComponent: () =>
          import(
            './pages/location-management/location-management.component'
          ).then((c) => c.LocationManagementComponent),
        data: { title: 'Quản lý Địa điểm' },
      },
      {
        path: 'tours/:id/costing',
        loadComponent: () =>
          import('./pages/tour-costing/tour-costing.component').then(
            (c) => c.TourCostingComponent
          ),
        data: { title: 'Chiết tính Giá Tour' },
      },
      {
        path: 'tours',
        loadComponent: () =>
          import('./pages/tour-list/tour-list.component').then(
            (c) => c.TourListComponent
          ),
        data: { title: 'Quản lý Tour' },
      },
      {
        path: 'tours/new',
        loadComponent: () =>
          import('./pages/tour-form/tour-form.component').then(
            (c) => c.TourFormComponent
          ),
        data: { title: 'Tạo Tour mới' },
      },
      {
        path: 'tours/:id',
        loadComponent: () =>
          import('./pages/tour-form/tour-form.component').then(
            (c) => c.TourFormComponent
          ),
        data: { title: 'Chi tiết Tour' },
      },
      {
        path: 'tours/:id/schedule',
        loadComponent: () =>
          import('./pages/tour-schedule/tour-schedule.component').then(
            (c) => c.TourScheduleComponent
          ),
        data: { title: 'Xây dựng Lịch trình' },
      },
      {
        path: 'tours/:id/departure-dates',
        loadComponent: () =>
          import(
            './pages/tour-departure-date/tour-departure-date.component'
          ).then((c) => c.TourDepartureDateComponent),
        data: { title: 'Quản lý Lịch Khởi Hành' },
      },
      {
        path: 'request-bookings',
        loadComponent: () =>
          import(
            './pages/request-booking-list/request-booking-list.component'
          ).then((c) => c.RequestBookingListComponent),
        data: { title: 'Danh sách Yêu cầu' },
      },
      {
        path: 'request-bookings/:id',
        loadComponent: () =>
          import(
            './pages/request-booking-detail/request-booking-detail.component'
          ).then((c) => c.RequestBookingDetailComponent),
        data: { title: 'Chi tiết Yêu cầu' },
      },
    ],
  },
];
