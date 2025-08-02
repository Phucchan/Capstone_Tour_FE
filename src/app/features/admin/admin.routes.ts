import {Routes} from '@angular/router';
import {AdminTestComponent} from './admin-test/admin-test.component';
import {ListCustomerComponent} from './list-customer/list-customer.component';
import {ListStaffComponent} from './list-staff/list-staff.component';
// 1. Import component tạo/sửa nhân viên
import {PostStaffDetailComponent} from './post-staff-detail/post-staff-detail.component';

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
  {
    path: 'staff', // URL: /admin/staff
    component: ListStaffComponent,
  },
  // 2. Thêm đường dẫn cho trang TẠO MỚI nhân viên
  {
    path: 'staff/create', // URL sẽ là: /admin/staff/create
    component: PostStaffDetailComponent,
  },
  // 3. (Tùy chọn) Thêm đường dẫn cho trang CHỈNH SỬA nhân viên
  {
    path: 'staff/:id/edit', // URL sẽ là: /admin/staff/123/edit
    component: PostStaffDetailComponent,
  },
];
