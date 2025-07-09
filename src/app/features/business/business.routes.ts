import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { TourListComponent } from './pages/tour-list/tour-list.component';
// import { TourFormComponent } from './pages/tour-form/tour-form.component'; // <-- TẠM THỜI XÓA DÒNG NÀY

export const BUSINESS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'tours', pathMatch: 'full' },
      {
        path: 'tours',
        component: TourListComponent,
        data: { title: 'Quản lý Tour' },
      },
      // === CÁC ROUTE GÂY LỖI ĐÃ ĐƯỢC XÓA TẠM THỜI ===
      // Chúng ta sẽ thêm lại chúng ở giai đoạn sau khi đã tạo TourFormComponent
      /*
      {
        path: 'tours/new',
        component: TourFormComponent,
        data: { title: 'Tạo Tour mới' }
      },
      {
        path: 'tours/:id',
        component: TourFormComponent,
        data: { title: 'Chi tiết Tour' }
      }
      */
      // ================================================
    ],
  },
];
