import { Routes } from '@angular/router';
import { ListServiceProviderComponent } from './list-service-provider/list-service-provider.component';
// 1. Import component "Thêm mới Nhà cung cấp"
import { AddServiceProviderComponent } from './list-service-provider/add-service-provider/add-service-provider.component';

export const COORDINATOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'service-providers',
    pathMatch: 'full',
  },
  {
    path: 'service-providers', // URL: /coordinator/service-providers
    component: ListServiceProviderComponent,
  },
  // 2. Thêm đường dẫn cho trang tạo mới
  {
    path: 'service-providers/create', // URL sẽ là: /coordinator/service-providers/create
    component: AddServiceProviderComponent,
  },
];
