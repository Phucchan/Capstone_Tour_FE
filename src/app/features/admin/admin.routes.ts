import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AdminTestComponent } from './admin-test/admin-test.component';
// 1. Import component danh sách khách hàng
import { ListCustomerComponent } from './list-customer/list-customer.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent, // Layout này sẽ được áp dụng cho tất cả các trang con
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'test',
        component: AdminTestComponent,
      },
      // 2. Thêm route mới cho trang quản lý khách hàng
      {
        path: 'customers', // URL cuối cùng sẽ là: /admin/customers
        component: ListCustomerComponent,
      },
    ],
  },
];
