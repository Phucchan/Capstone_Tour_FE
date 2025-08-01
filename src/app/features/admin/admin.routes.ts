import { Routes } from '@angular/router';
import { AdminTestComponent } from './admin-test/admin-test.component';
import { ListCustomerComponent } from './list-customer/list-customer.component';
// 1. Import component danh sách nhân viên
import { ListStaffComponent } from './list-staff/list-staff.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'customers', // Chuyển hướng đến trang khách hàng làm mặc định
    pathMatch: 'full',
  },
  {
    path: 'test',
    component: AdminTestComponent,
  },
  {
    path: 'customers', // URL: /admin/customers
    component: ListCustomerComponent,
  },
  // 2. Thêm route cho trang quản lý nhân viên
  {
    path: 'staff', // URL: /admin/staff
    component: ListStaffComponent,
  },
];
