import { Routes } from '@angular/router';
// Đã sửa đường dẫn import để trỏ vào thư mục 'pages'
import { ListServiceProviderComponent } from './pages/list-service-provider/list-service-provider.component';
import { AddServiceProviderComponent } from './pages/list-service-provider/add-service-provider/add-service-provider.component';
import { ServiceTypeManagementComponent } from './pages/service-type-management/service-type-management.component';
import { ServiceApprovalComponent } from './pages/service-approval/service-approval.component';

export const COORDINATOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'service-providers',
    pathMatch: 'full',
  },
  {
    path: 'service-providers',
    component: ListServiceProviderComponent,
  },
  {
    path: 'service-providers/create',
    component: AddServiceProviderComponent,
  },
  {
    // Route này dùng cho cả việc xem chi tiết và chỉnh sửa
    path: 'service-providers/edit/:id',
    component: AddServiceProviderComponent,
  },
  {
    path: 'service-types', // URL: /coordinator/service-types
    component: ServiceTypeManagementComponent,
  },
  // Chức năng phê duyệt dịch vụ
  {
    path: 'service-approval', // URL: /coordinator/service-approval
    component: ServiceApprovalComponent,
  },
];
