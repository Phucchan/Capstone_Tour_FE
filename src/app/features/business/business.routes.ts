import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { TourListComponent } from './pages/tour-list/tour-list.component';
import { TourFormComponent } from './pages/tour-form/tour-form.component';

export const BUSINESS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'tours', pathMatch: 'full' },
      {
        path: 'tours', // Route cho trang danh sách Tour
        component: TourListComponent,
        data: { title: 'Quản lý Tour' },
      },

      {
        path: 'tours/new', // Route cho trang tạo mới
        component: TourFormComponent,
        data: { title: 'Tạo Tour mới' },
      },
      {
        path: 'tours/:id', // Route cho trang cập nhật/chi tiết
        component: TourFormComponent,
        data: { title: 'Chi tiết Tour' },
      },
    ],
  },
];
