import { Routes } from '@angular/router';
import { AdminTestComponent } from './admin-test/admin-test.component';
// 1. Giữ lại import component mới của bạn
import { ListCustomerComponent } from './list-customer/list-customer.component';

// Phiên bản cuối cùng, kết hợp thay đổi của cả hai bạn
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'test', // Hoặc 'dashboard' nếu bạn có trang dashboard cho admin
    pathMatch: 'full',
  },
  {
    path: 'test',
    component: AdminTestComponent,
  },
  // 2. Thêm route mới của bạn vào cấu trúc phẳng này
  {
    path: 'customers', // URL cuối cùng sẽ là /admin/customers
    component: ListCustomerComponent,
  },
  // Thêm các route khác của admin ở đây nếu có
];
