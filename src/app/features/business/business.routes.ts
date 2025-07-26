import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { TourListComponent } from './pages/tour-list/tour-list.component';
import { TourFormComponent } from './pages/tour-form/tour-form.component';
import { TourScheduleComponent } from './pages/tour-schedule/tour-schedule.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LocationManagementComponent } from './pages/location-management/location-management.component';

export const BUSINESS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Route cho trang Dashboard
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },

      //ROUTE CHO LOCATION
      {
        path: 'locations',
        component: LocationManagementComponent,
        data: { title: 'Quản lý Địa điểm' },
      },

      // Route cho trang danh sách Tour
      {
        path: 'tours',
        component: TourListComponent,
        data: { title: 'Quản lý Tour' },
      },

      // Route cho trang tạo mới
      {
        path: 'tours/new',
        component: TourFormComponent,
        data: { title: 'Tạo Tour mới' },
      },

      // Route cho trang cập nhật/chi tiết
      {
        path: 'tours/:id',
        component: TourFormComponent,
        data: { title: 'Chi tiết Tour' },
      },

      // ROUTE CHO TRANG LỊCH TRÌNH
      {
        path: 'tours/:id/schedule',
        component: TourScheduleComponent,
        data: { title: 'Xây dựng Lịch trình' },
      },
    ],
  },
];
