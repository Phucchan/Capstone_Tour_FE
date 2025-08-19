import { Routes } from '@angular/router';

// LOẠI BỎ: import { LayoutComponent } from './layout/layout.component';

/**
 * ADMIN_ROUTES giờ đây là một mảng các trang đơn lẻ.
 * Chúng sẽ được hiển thị bên trong <router-outlet> của LayoutComponent chung.
 */
export const ADMIN_ROUTES: Routes = [
  // Bỏ đi cấu trúc cha-con với LayoutComponent
  { path: '', redirectTo: 'list-customer', pathMatch: 'full' },
  {
    path: 'list-customer',
    // Sử dụng lazy loading cho standalone component
    loadComponent: () =>
      import('./pages/list-customer/list-customer.component').then(
        (m) => m.ListCustomerComponent
      ),
  },
  // {
    // path: 'list-staff',
    // loadComponent: () =>
    //   import('./list-staff/list-staff.component').then(
    //     (m) => m.ListStaffComponent
    //   ),
  // },
  {
    path: 'post-staff-detail',
    loadComponent: () =>
      import('./pages/post-staff-detail/post-staff-detail.component').then(
        (m) => m.PostStaffDetailComponent
      ),
  },
];
